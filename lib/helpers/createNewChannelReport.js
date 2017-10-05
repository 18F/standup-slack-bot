const log = require('../../getLogger')('channel report');
const reportForChannel = require('./reports/forChannel');

module.exports = function createNewChannelReport(bot, channel, standups) {
  const report = reportForChannel(channel, standups);

  log.verbose(`Sending report for ${channel.name}`);

  const standupNotice = {
    text: `Today's standup for <#${channel.name}> is in this thread :point_down:. ` +
      'If you missed the standup, you can still submit! Just emoji one of my ' +
      'messages in the next few minutes and I\'ll include you.',
    attachments: [],
    channel: channel.name
  };

  bot.say(standupNotice, (sayErr, threadResponse) => {
    bot.replyInThread(threadResponse, report, (threadErr, response) => {
      if (threadErr) {
        log.error(threadErr);
      } else {
        channel.update({
          latestReport: response.ts
        });
      }
    });
  });
};
