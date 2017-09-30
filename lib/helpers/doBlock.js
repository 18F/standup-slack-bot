

const log = require('../../getLogger')('block recorder');
const moment = require('moment');
const timeHelper = require('./time');
const standupHelper = require('./getStandupReport');
const reportHelper = require('./doChannelReport');
const models = require('../../models');

module.exports = function doBlock(bot, message, blockChannel, blockUser) {
  log.verbose(`Got user standup info:\n${message.match[0]}`);

  let localReport = '';
  const content = message.match[4];
  let userRealName,
    thumbUrl;

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
      }).then((standup) => {
        const notes = content.trim().split(/\n/);
        let yesterday = standup.yesterday;
        let today = standup.today;
        let blockers = standup.blockers;
        let goal = standup.goal;

        for (const note in notes) {
          localReport += '\n\n';
          let item = notes[note].replace(/\n/g, '');
          const firstChar = item[0].toLowerCase();
          item = item.replace(/^[ytbg]:?\s*/i, '');

          switch (firstChar) {
            case 'y':
              localReport += `*Yesterday*\n${item}`;
              yesterday = item;
              break;
            case 't':
              localReport += `*Today*\n${item}`;
              today = item;
              break;
            case 'b':
              localReport += `*Blockers*\n${item}`;
              blockers = item;
              break;
            case 'g':
              localReport += `*Goal*\n${item}`;
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
            }).then((standup) => {
              const now = timeHelper.getDisplayFormat();
              const channelTime = timeHelper.getDisplayFormat(channel.time);
              if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
                log.verbose(`Standup info recorded for ${userRealName}`);
                bot.reply(message, {
                  text: `Thanks! Your standup for <#${blockChannel
                  }> is recorded and will be reported at ${
                    timeHelper.getDisplayFormat(channel.time)
                  }.  It will look like:`,
                  attachments: [standupHelper(standup)]
                });
              } else {
                log.verbose(`Late report from ${userRealName}; updating previous report`);
                bot.reply(message, {
                  text: `Thanks! Your standup for <#${blockChannel
                  }> is recorded.  It will look like:`,
                  attachments: [standupHelper(standup)]
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
