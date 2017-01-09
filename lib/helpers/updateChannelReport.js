'use strict';

const log              = require('../../getLogger')('channel report');
const reportForUpdate  = require('./reports/forChannelUpdate');

module.exports = function updateChannelReport(bot, channel, standups, username, teamDomain) {
  let report = reportForUpdate(channel, standups);

  bot.api.chat.update(report, function(err) {
    if (err) {
      console.log('Error! '+err);
    } else {
      log.verbose('Edited the standup for '+channel.name);
      bot.api.channels.info({'channel':channel.name}, function (err, response) {
        if (err) {
          console.log(err);
        } else {
          var link = 'https://'+teamDomain+'.slack.com/archives/'+
            response.channel.name+'/p'+channel.latestReport.replace('.','');
          bot.say({
            channel: channel.name,
            text: ':bell: I\'ve updated the report with a standup from '+
              username+': '+link
          });
        }
      });
    }
  });
};
