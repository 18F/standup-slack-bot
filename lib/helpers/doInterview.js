'use strict';

var log = require('../../getLogger')('interview recorder');
var models = require('../../models');
var moment = require('moment');
var Queue = require('better-queue');
var timeHelper = require('./time');
var standupHelper = require('./getStandupReport');
var reportHelper = require('./doChannelReport');

const userInterviewQueue = { };

module.exports = function doInterview(bot, interviewChannel, interviewUser, singleSection) {
  if(!userInterviewQueue[interviewUser]) {
    userInterviewQueue[interviewUser] = {
     queue: new Queue(handleQueuedItem),
     current: ''
   };
  }
  userInterviewQueue[interviewUser].queue.push({
    bot, interviewChannel, interviewUser, singleSection, position: userInterviewQueue[interviewUser].queue.length
  });

  if(userInterviewQueue[interviewUser].queue.length > 0) {
    bot.say({
      text: `> :thumbsup: I see you also want to do a standup for <#${interviewChannel}>, but you're already doing one for <#${userInterviewQueue[interviewUser].current}>.  Once you finish this one up, I'll ask you for your info for <#${interviewChannel}>!`,
      channel: interviewUser
    });
  }
};

module.exports.flush = function() {
  for(let user of Object.keys(userInterviewQueue)) {
    userInterviewQueue[user].queue.destroy();
    delete userInterviewQueue[user];
  }
};

function handleQueuedItem(dequeuedObject, taskFinished) {
  const bot = dequeuedObject.bot;
  const interviewUser = dequeuedObject.interviewUser;
  const interviewChannel = dequeuedObject.interviewChannel;
  const singleSection = dequeuedObject.singleSection;
  userInterviewQueue[interviewUser].current = interviewChannel;

  log.verbose('Starting an interview with '+interviewUser+' for channel ' + interviewChannel);

  models.Channel.findOne({
    where: {
      name: interviewChannel
    }
  }).then(function(channel) {
    if (channel) {
      var userRealName;
      var thumbUrl;
      var pastBlockers = '';

      bot.api.users.info({'user':interviewUser}, function(err, response) {
        userRealName = response.user.real_name || response.user.name;
        thumbUrl = response.user.profile.image_72;
      });

      models.Standup.findAll({
        where: {
          user: interviewUser,
          channel: interviewChannel,
          createdAt: {
            $gt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        order: [[ 'createdAt', 'DESC' ]]
      }).then(function (standups, e) {
        if (standups.length > 0) {
          pastBlockers += ' Recent blockers were:';
          for (var s in standups) {
            pastBlockers += '\n> '+standups[s].blockers;
          }
        }

        bot.startPrivateConversation({user: interviewUser}, function(response, convo){
          // TODO: consider allowing multi-line responses
          var interviewSetup = new Promise(function(resolve, reject) {
            if(singleSection) {
              // Need to make sure the user already has a standup recorded for today.
              // If not, prompt them to do it because there's nothing to edit.
              if(standups.length && timeHelper.datesAreSameDay(standups[0].createdAt, new Date())) {
                convo.say(':thumbsup: You bet!  Let\'s update the '+singleSection+' portion of your'+
                  ' standup for <#'+interviewChannel+'> (Say "exit" to cancel this update)\nYour previous response was:\n>'+
                  standups[0][singleSection]);
                resolve();
              } else {
                convo.ask(':thinking_face: It seems you haven\'t recorded a standup for today yet.'+
                  ' Would you like to do that now?', [
                    {
                      pattern: bot.utterances.yes,
                      callback: function(_, c) {
                        c.next();
                        resolve();
                      }
                    },
                    {
                      default: true,
                      callback: function(_, c) {
                        c.say('Okay! Maybe later. :simple_smile:');
                        c.next();
                        reject();
                      }
                    }
                  ]);
              }
            } else {
              let intro = `Hey there! Let's`;
              if(dequeuedObject.position > 0) {
                // The position is only zero if the queue was empty
                // when this standup was added.
                intro = `Alright, now let's`;
              }
              convo.say(`${intro} record your standup for <#${interviewChannel}>`+
                ' (Say "skip" to skip any of the questions or "exit" to stop):');
              resolve();
            }
          });

          // Flag whether the conversation is closed by
          // user action.
          var exited = false;
          var checkForExit = function(response, conversation) {
            if(response.text.match(/^exit$/i)) {
              // Clear the conversation queue.  We can call
              // conversation.stop(), but that will prevent this say
              // from happening, or we can put conversation.stop()
              // inside a timeout, but that's a timing guessing game
              // about how long to wait - too short and the say
              // won't happen, too long and the next ask will happen.
              // So...  to heck with time guessing, just clear
              // the queue of stuff to come.
              conversation.topics['default'].length = 0;
              conversation.messages.length = 0;
              conversation.say('Okay! I won\'t record anything right now. :simple_smile:');
              conversation.next();
              exited = true;
              return true;
            }
            return false;
          }

          interviewSetup.then(function() {
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
                question: `What are you doing today? (Use :pager: if you're available for projects)`,
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
              if(reminderTimer) {
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
            for(let section of sections) {
              if(!singleSection || singleSection == section.name) {
                convo.ask(section.question, function(response, conversation) {
                  if(!checkForExit(response, conversation)) {
                    if (!response.text.match(/^skip$/ig)) {
                      answers[section.name] = response.text;
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

            convo.on('end',function(convo) {
              if(reminderTimer) {
                clearTimeout(reminderTimer);
                reminderTimer = null;
              }

              if (!exited && convo.status === 'completed') {
                // botkit provides a cool function to get all responses, but it was easier
                // to just set them during the convo
                // var res = convo.extractResponses();

                models.Standup.findOrCreate({
                  where: {
                    channel: interviewChannel,
                    date: timeHelper.getReportFormat(),
                    user: interviewUser
                  }
                }).then(function (standup) {
                  // If the user skipped sections, use the
                  // answers already in the standup.
                  for(let section in answers) {
                    if(!answers[section]) {
                      answers[section] = standup[section];
                    }
                  }

                  models.Standup.update(
                    {
                      yesterday: answers.yesterday,
                      today: answers.today,
                      blockers: answers.blockers,
                      goal: answers.goal,
                      userRealName: userRealName,
                      thumbUrl: thumbUrl
                    },
                    {
                      where: {
                        channel: interviewChannel,
                        date: timeHelper.getReportFormat(),
                        user: interviewUser
                      }
                    }
                  ).then(function () {
                    var latestReport = '';
                    models.Channel.findOne({
                      where: {
                        name: interviewChannel
                      }
                    }).then(function(channel) {
                      latestReport = channel.latestReport;
                    });
                    models.Standup.findOne({
                      where: {
                        channel: interviewChannel,
                        date: timeHelper.getReportFormat(),
                        user: interviewUser
                      }
                    }).then(function(standup) {
                      var now = timeHelper.getDisplayFormat();
                      var channelTime = timeHelper.getDisplayFormat(channel.time);
                      if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                        log.verbose('Standup info recorded for ' + userRealName);
                        bot.say({
                          text: 'Thanks! Your standup for <#'+interviewChannel+
                          '> is recorded and will be reported at ' +
                          timeHelper.getDisplayFormat(channel.time) +
                          '.  It will look like:',
                          attachments: [ standupHelper(standup) ],
                          channel: interviewUser
                        });
                      } else {
                        log.verbose('Late report from '+userRealName+'; updating previous report');
                        bot.say({
                          text: 'Thanks! Your standup for <#'+interviewChannel+
                          '> is recorded and and the existing report will be updated!',
                          channel: interviewUser
                        });
                        reportHelper(bot, interviewChannel, true, userRealName);
                      }
                      taskFinished();
                    });
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
};
