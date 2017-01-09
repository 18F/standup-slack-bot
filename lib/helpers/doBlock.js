'use strict';

const log = require('../../getLogger')('block recorder');
const moment = require('moment');
const timeHelper = require('./time');
const saveStandupReport = require('./saveStandupReport');
const standupHelper = require('../bot/message-builders').standupReport.getStandupReportAttachment;
const reportHelper = require('./doChannelReport');
const models = require('../../models');

module.exports = function doBlock(bot, message, blockChannel, blockUser) {
  log.verbose('Got user standup info:\n' + message.match[0]);

  const content = message.match[4];

  models.Channel.findOne({
    where: {
      name: blockChannel
    }
  }).then(function (channel) {
    if (channel) {
      const notes = content.trim().split(/\n/);

      const newStandup = {
        channel: blockChannel,
        date: timeHelper.getReportFormat(),
        user: message.user
      };

      for (var note in notes) {
        let item = notes[note].replace(/\n/g,'');
        const firstChar = item[0].toLowerCase();
        item = item.replace(/^[ytbg]:?\s*/i, '');

        switch (firstChar) {
          case 'y':
            newStandup.yesterday = item;
            break;

          case 't':
            newStandup.today = item;
            break;

          case 'b':
            newStandup.blockers = item;
            break;

          case 'g':
            newStandup.goal = item;
            break;

          default:
            log.info('no match for '+item);
        }
      }

      saveStandupReport(bot, newStandup).then(out => {
        if(out.updatedExistingReport) {
          log.verbose(`Late report from ${out.standup.userRealName}; updating previous report`);
          bot.reply(message, {
            text: `Thanks! Your standup for <#${blockChannel}> is recorded.  It will look like:`,
            attachments: [ standupHelper(out.standup) ]
          });
          reportHelper(bot, blockChannel, true, out.standup.userRealName);
        } else {
          log.verbose(`Standup info recorded for ${out.standup.userRealName}`);
          bot.reply(message, {
            text: `Thanks! Your standup for <#${blockChannel}> is recorded and will be reported at ${timeHelper.getDisplayFormat(channel.time)}.  It will look like:`,
            attachments: [ standupHelper(out.standup) ]
          });
        }
      });
    }
  });
};
