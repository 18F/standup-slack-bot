'use strict';

var asyncLib = require('async');
var un = require('underscore');
var moment = require('moment');
var models = require('../../models');

function runReports(anytimeBot) {
  var time = moment().format('HHmm');
  var date = moment().format('YYYY-MM-DD');

  // Find channels that want a report at this minute
  models.Channel.findAll({
    where: {
      frequency: 'daily',
      time: time
    }
  }).then(function (channels) {
    // Iterate over the channels
    un.each(channels, function(channel) {
      // Find standup messages for that channel & for today
      models.Standup.findAll({
        where: {
          channel: channel.name,
          date: date
        }
      }).then(function (standups) {
        // Begin a Slack message for this channel
        // https://api.slack.com/docs/attachments
        var report = {
          text: '<!here> Todays standup for <#'+channel.name+'>:',
          attachments: [],
          channel: channel.name
        };
        var attachments = [];
        asyncLib.series([
          // Iterate over this channels standup messages
          function(callback) {
            un.each(standups, function (standup) {
              var fields = [];
              if (standup.yesterday) {
                fields.push({
                    title: 'Yesterday',
                    value: standup.yesterday,
                    short: false
                });
              }
              if (standup.today) {
                fields.push({
                  title: 'Today',
                  value: standup.today,
                  short: false
                });
              }
              if (standup.blockers) {
                fields.push({
                  title: 'Blockers',
                  value: standup.blockers,
                  short: false
                });
              }
              if (standup.goal) {
                fields.push({
                  title: 'Goal',
                  value: standup.goal,
                  short: false
                });
              }
              attachments.push({
                title: '<@'+standup.user+'>',
                fields: fields
              });
            });
            callback(null);
          },
          // Send that report off to Slack
          function(callback) {
            report.attachments = attachments;
            anytimeBot.say(report);
            callback(null);
          }
        ]);
      });
    });
  });
}

module.exports = function(anytimeBot) {
  return function() {
    runReports(anytimeBot);
  };
};
