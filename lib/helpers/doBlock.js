const log = require('../../getLogger')('block recorder');
const moment = require('moment');
const timeHelper = require('./time');
const standupHelper = require('./getStandupReport');
const reportHelper = require('./doChannelReport');
const models = require('../../models');

module.exports = function doBlock(bot, message, blockChannel) {
  log.verbose(`Got user standup info:\n${message.match[0]}`);

  const content = message.match[4];
  let userRealName;
  let thumbUrl;

  models.Channel.findOne({
    where: {
      name: blockChannel
    }
  }).then((channel) => {
    if (channel) {
      models.Standup.findOrCreate({
        where: {
          channel: blockChannel,
          date: timeHelper.getReportFormat(),
          user: message.user
        }
      }).then((initialStandup) => {
        const notes = content.trim().split(/\n/);
        let {
          yesterday, today, blockers, goal
        } = initialStandup;

        for (const note of Object.keys(notes)) {
          let item = notes[note].replace(/\n/g, '');
          const firstChar = item[0].toLowerCase();
          item = item.replace(/^[ytbg]:?\s*/i, '');

          switch (firstChar) {
            case 'y':
              yesterday = item;
              break;

            case 't':
              today = item;
              break;

            case 'b':
              blockers = item;
              break;

            case 'g':
              goal = item;
              break;

            default:
              log.info(`no match for ${item}`);
          }
        }

        bot.api.users.info({ user: message.user }, (err, response) => {
          userRealName = response.user.real_name || response.user.name;
          thumbUrl = response.user.profile.image_72;
          models.Standup.update(
            {
              yesterday,
              today,
              blockers,
              goal,
              userRealName,
              thumbUrl
            },
            {
              where: {
                channel: blockChannel,
                date: timeHelper.getReportFormat(),
                user: message.user
              }
            }
          ).then(() => {
            models.Standup.findOne({
              where: {
                channel: blockChannel,
                date: timeHelper.getReportFormat(),
                user: message.user
              }
            }).then((updatedStandup) => {
              const now = timeHelper.getDisplayFormat();
              const channelTime = timeHelper.getDisplayFormat(channel.time);
              if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                log.verbose(`Standup info recorded for ${userRealName}`);
                bot.reply(message, {
                  text: `Thanks! Your standup for <#${blockChannel
                  }> is recorded and will be reported at ${
                    timeHelper.getDisplayFormat(channel.time)
                  }.  It will look like:`,
                  attachments: [standupHelper(updatedStandup)]
                });
              } else {
                log.verbose(`Late report from ${userRealName}; updating previous report`);
                bot.reply(message, {
                  text: `Thanks! Your standup for <#${blockChannel
                  }> is recorded.  It will look like:`,
                  attachments: [standupHelper(updatedStandup)]
                });
                reportHelper(bot, blockChannel, true, userRealName);
              }
            });
          });
        });
      });
    }
  });
};
