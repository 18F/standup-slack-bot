

const log = require('../../getLogger')('channel report');
const reportForUpdate = require('./reports/forChannelUpdate');

module.exports = function updateChannelReport(bot, channel, standups, username) {
  const report = reportForUpdate(channel, standups);
  let teamDomain;

  function performUpdate() {
    bot.api.chat.update(report, (err) => {
      if (err) {
        console.log(`Error! ${err}`);
      } else {
        log.verbose(`Edited the standup for ${channel.name}`);
        bot.api.channels.info({ channel: channel.name }, (err, response) => {
          if (err) {
            console.log(err);
          } else {
            const link = `https://${teamDomain}.slack.com/archives/${
              response.channel.name}/p${channel.latestReport.replace('.', '')}`;
            bot.say({
              channel: channel.name,
              text: `:bell: I've updated the report with a standup from ${
                username}: ${link}`
            });
          }
        });
      }
    });
  }

  bot.api.team.info({}, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      teamDomain = response.team.domain;
    }
    performUpdate();
  });
};
