'use strict';

const log                 = require('../../getLogger')('channel report');
const async               = require('async');
const models              = require('../../models');
const timeHelper          = require('./time');
const reportForChannel    = require('./reports/forChannel');
const reportForUpdate     = require('./reports/forChannelUpdate');

module.exports = function doChannelReport(bot, reportChannel, update, userRealName, actionCallback) {
  actionCallback = actionCallback || function () {};

  var teamDomain;
  if (update) {
    bot.api.team.info({}, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        teamDomain = response.team.domain;
      }
    });
  }

  function createNewStandup(channel, standups) {
    let report = reportForChannel(channel, standups);
    log.verbose('Sending report for ' + channel.name);
    bot.say(report, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        models.Channel.update({
          latestReport: response.ts
        }, {
          where: {
            name: channel.name
          }
        });
        bot.say({
          text: 'If you missed the standup, you can still submit! Just emoji '+
            'one of my messages in the next few minutes and I\'ll include you.',
          channel: channel.name
        });
      }
    });
  }

  function updateStandup(channel, standups) {
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
                userRealName+': '+link
            });
          }
        });
      }
    });
  }

  let channel;

  models.Channel
    .findOne({
      where: {name: reportChannel}
    })
    .then(function(foundChannel) {
      channel = foundChannel;
      return models.Standup.findAll({
        where: {
          channel: channel.name,
          date: timeHelper.getCurrentDate()
        }
      });
    })
    .then(function (standups) {
      async.series([
        function(callback) {
          if (update) {
            updateStandup(channel, standups);
          } else {
            createNewStandup(channel, standups);
          }
          callback(null);
        }, actionCallback
      ]);
    });
};
