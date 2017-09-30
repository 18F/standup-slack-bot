const log = require('../../getLogger')('interview recorder');
const models = require('../../models');
const moment = require('moment');
const Queue = require('better-queue');
const timeHelper = require('./time');
const standupHelper = require('./getStandupReport');
const reportHelper = require('./doChannelReport');

const userInterviewQueue = { };

function handleQueuedItem(dequeuedObject, taskFinished) {
  const {
    bot, interviewUser, interviewChannel, singleSection
  } = dequeuedObject;
  userInterviewQueue[interviewUser].current = interviewChannel;

  log.verbose(`Starting an interview with ${interviewUser} for channel ${interviewChannel}`);

  models.Channel.findOne({
    where: {
      name: interviewChannel
    }
  }).then((channel) => {
    if (channel) {
      let userRealName;
      let thumbUrl;
      let pastBlockers = '';

      bot.api.users.info({ user: interviewUser }, (err, response) => {
        userRealName = response.user.real_name || response.user.name;
        thumbUrl = response.user.profile.image_72;
      });

      models.Standup.findAll({
        where: {
          user: interviewUser,
          channel: interviewChannel,
          createdAt: {
            $gt: new Date(new Date() - (7 * 24 * 60 * 60 * 1000))
          }
        },
        order: [['createdAt', 'DESC']]
      }).then((standups) => {
        if (standups.length > 0) {
          pastBlockers += ' Recent blockers were:';
          for (const s of Object.keys(standups)) {
            pastBlockers += `\n> ${standups[s].blockers}`;
          }
        }

        bot.startPrivateConversation({ user: interviewUser }, (response, convo) => {
          // TODO: consider allowing multi-line responses
          const interviewSetup = new Promise(((resolve, reject) => {
            if (singleSection) {
              // Need to make sure the user already has a standup recorded for today.
              // If not, prompt them to do it because there's nothing to edit.
              if (standups.length && timeHelper.datesAreSameDay(standups[0].createdAt, new Date())) {
                convo.say(`:thumbsup: You bet!  Let's update the ${singleSection} portion of your` +
                  ` standup for <#${interviewChannel}> (Say "exit" to cancel this update)\nYour previous response was:\n>${
                    standups[0][singleSection]}`);
                resolve();
              } else {
                convo.ask(':thinking_face: It seems you haven\'t recorded a standup for today yet.' +
                  ' Would you like to do that now?', [
                  {
                    pattern: bot.utterances.yes,
                    callback(_, c) {
                      c.next();
                      resolve();
                    }
                  },
                  {
                    default: true,
                    callback(_, c) {
                      c.say('Okay! Maybe later. :simple_smile:');
                      c.next();
                      reject();
                    }
                  }
                ]);
              }
            } else {
              let intro = 'Hey there! Let\'s';
              if (dequeuedObject.position > 0) {
                // The position is only zero if the queue was empty
                // when this standup was added.
                intro = 'Alright, now let\'s';
              }
              convo.say(`${intro} record your standup for <#${interviewChannel}>` +
                ' (Say "skip" to skip any of the questions or "exit" to stop):');
              resolve();
            }
          }));

          // Flag whether the conversation is closed by
          // user action.
          let exited = false;
          const checkForExit = (exitResponse, inConversation) => {
            if (exitResponse.text.match(/^exit$/i)) {
              // Clear the conversation queue.  We can call
              // conversation.stop(), but that will prevent this say
              // from happening, or we can put conversation.stop()
              // inside a timeout, but that's a timing guessing game
              // about how long to wait - too short and the say
              // won't happen, too long and the next ask will happen.
              // So...  to heck with time guessing, just clear
              // the queue of stuff to come.
              const conversation = inConversation;
              conversation.messages.length = 0;
              conversation.say('Okay! I won\'t record anything right now. :simple_smile:');
              conversation.next();
              exited = true;
              return true;
            }
            return false;
          };

          interviewSetup.then(() => {
            const answers = {
              yesterday: null,
              today: null,
              blockers: null,
              goal: null
            };

            const sections = [
              {
                question: 'What did you do yesterday?',
                name: 'yesterday'
              },
              {
                question: 'What are you doing today? (Use :pager: if you\'re available for projects)',
                name: 'today'
              },
              {
                question: `What are your blockers?${pastBlockers}`,
                name: 'blockers'
              },
              {
                question: 'Any major goal for the day?',
                name: 'goal'
              }
            ];

            let reminderTimer = null;
            const resetReminderTimer = () => {
              if (reminderTimer) {
                clearTimeout(reminderTimer);
              }
              reminderTimer = setTimeout(() => {
                bot.say({
                  attachments: [{
                    color: '#FFBB00',
                    fields: [{
                      value: `:wave: Just a reminder, you haven't yet finished your standup for <#${interviewChannel}>. If you'd like to finish it, I'm still waiting on :point_up: the last question!  Otherwise, you can end this one by saying \`exit\`.`
                    }],
                    fallback: `Just a reminder, you haven't finished your standup for <#${interviewChannel}>`
                  }],
                  channel: interviewUser
                });
              }, 1 * 60 * 60 * 1000); // an hour
            };

            // Add questions and handling for each conversation section.
            for (const section of sections) {
              if (!singleSection || singleSection === section.name) {
                convo.ask(section.question, (questionResponse, conversation) => {
                  if (!checkForExit(questionResponse, conversation)) {
                    if (!questionResponse.text.match(/^skip$/ig)) {
                      answers[section.name] = questionResponse.text;
                    } else {
                      answers[section.name] = null;
                    }
                    conversation.next();
                  }
                  resetReminderTimer();
                });
              }
            }
            resetReminderTimer();

            convo.on('end', (convoEnd) => {
              if (reminderTimer) {
                clearTimeout(reminderTimer);
                reminderTimer = null;
              }

              if (!exited && convoEnd.status === 'completed') {
                // botkit provides a cool function to get all responses, but it was easier
                // to just set them during the convo
                // var res = convoEnd.extractResponses();

                models.Standup.findOrCreate({
                  where: {
                    channel: interviewChannel,
                    date: timeHelper.getReportFormat(),
                    user: interviewUser
                  }
                }).then((standup) => {
                  // If the user skipped sections, use the
                  // answers already in the standup.
                  for (const section in answers) {
                    if (!answers[section]) {
                      answers[section] = standup[section];
                    }
                  }

                  models.Standup.update(
                    {
                      yesterday: answers.yesterday,
                      today: answers.today,
                      blockers: answers.blockers,
                      goal: answers.goal,
                      userRealName,
                      thumbUrl
                    },
                    {
                      where: {
                        channel: interviewChannel,
                        date: timeHelper.getReportFormat(),
                        user: interviewUser
                      }
                    }
                  ).then(() => {
                    const now = timeHelper.getDisplayFormat();
                    const channelTime = timeHelper.getDisplayFormat(channel.time);
                    if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                      log.verbose(`Standup info recorded for ${userRealName}`);
                      bot.say({
                        text: `Thanks! Your standup for <#${interviewChannel
                        }> is recorded and will be reported at ${
                          timeHelper.getDisplayFormat(channel.time)
                        }.  It will look like:`,
                        attachments: [standupHelper(standup)],
                        channel: interviewUser
                      });
                    } else {
                      log.verbose(`Late report from ${userRealName}; updating previous report`);
                      bot.say({
                        text: `Thanks! Your standup for <#${interviewChannel
                        }> is recorded and and the existing report will be updated!`,
                        channel: interviewUser
                      });
                      reportHelper(bot, interviewChannel, true, userRealName);
                    }
                    taskFinished();
                  });
                });
              } else {
                // something happened that caused the conversation to stop prematurely
                taskFinished();
              }
            });
          });
        });
      });
    }
  });
}

module.exports = function doInterview(bot, interviewChannel, interviewUser, singleSection) {
  if (!userInterviewQueue[interviewUser]) {
    userInterviewQueue[interviewUser] = {
      queue: new Queue(handleQueuedItem),
      current: ''
    };
  }
  userInterviewQueue[interviewUser].queue.push({
    bot, interviewChannel, interviewUser, singleSection, position: userInterviewQueue[interviewUser].queue.length
  });

  if (userInterviewQueue[interviewUser].queue.length > 0) {
    bot.say({
      attachments: [{
        color: '#00BB00',
        fields: [{
          value: `:thumbsup: I see you also want to do a standup for <#${interviewChannel}>, but you're already doing one for <#${userInterviewQueue[interviewUser].current}>.  Once you finish this one up, I'll ask you for your info for <#${interviewChannel}>!`
        }],
        fallback: `We'll get to the <#${interviewChannel}> standup as soon as this one is done!`
      }],
      channel: interviewUser
      // text: `> :thumbsup: I see you also want to do a standup for <#${interviewChannel}>, but you're already doing one for <#${userInterviewQueue[interviewUser].current}>.  Once you finish this one up, I'll ask you for your info for <#${interviewChannel}>!`,
      // channel: interviewUser
    });
  }
};

module.exports.flush = () => {
  for (const user of Object.keys(userInterviewQueue)) {
    userInterviewQueue[user].queue.destroy();
    delete userInterviewQueue[user];
  }
};
