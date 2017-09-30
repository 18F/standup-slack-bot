const log = require('../../getLogger')('channel report');
const reportForChannel = require('./reports/forChannel');

module.exports = function createNewChannelReport(bot, channel, standups) {
  const report = reportForChannel(channel, standups);

  log.verbose(`Sending report for ${channel.name}`);

  bot.say(report, (err, response) => {
    if (err) {
      log.error(err);
    } else {
      channel.update({
        latestReport: response.ts
      });
      bot.say({
        text: 'If you missed the standup, you can still submit! Just emoji ' +
          'one of my messages in the next few minutes and I\'ll include you.',
        channel: channel.name
      });
    }
  });
};
