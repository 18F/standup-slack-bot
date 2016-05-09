'use strict';

var log = require('../../getLogger')('report runner');
var asyncLib = require('async');
var _ = require('underscore');
var moment = require('moment');
var models = require('../../models');
var helpers = require('../helpers');
var fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
  var time = helpers.time.getScheduleFormat();
  var date = helpers.time.getCurrentDate();

  // Don't run if today is a federal holiday
  if(fedHolidays.isAHoliday()) {
    return;
  }


  models.Channel.findAll({
    where: {
      time: time
    }
  }).then(function (channels) {
    if(channels.length > 0) {
      log.info('Reporting standups for ' + channels.length + ' channel(s)');

      // Iterate over the channels
      _.each(channels, function(channel) {
        // Set report audience
        var audience = channel.audience === null ? '<!here>' : channel.audience;
        if (audience.search(/<!/) !== 0) {
          audience = '@'+audience;
        }

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
            attachments: [],
            channel: channel.name
          };
          var attachments = [];
          asyncLib.series([
            // Iterate over this channels standup messages
            function(callback) {
              _.each(standups, function (standup) {
                attachments.push(helpers.getStandupReport(standup));
              });
              callback(null);
            },

            function(callback) {
              // Create summary statistics
              var fields = [];

              // Find common channels
              var regex = /<#\w+>/g;
              var search;
              var results = {};
              var commonChannels = '';
              while ((search = regex.exec(JSON.stringify(attachments))) !== null) {
                if (results[search[0]]) {
                  results[search[0]] += 1;
                } else {
                  results[search[0]] = 1;
                }
              }
              for (var i in results) {
                if (results[i] > 1) {
                  // common[i] = results[i];
                  commonChannels += '- ' + i + ' ('+results[i]+')\n';
                }
              }

              // Find people who used :pager: to indicate availability
              var pager = '';
              for (var a in attachments) {
                if (attachments[a].fields[1].value.search(/:pager:/) >= 0) {
                  pager += '- '+attachments[a].title + '\n';
                }
              }

              // Find total number of standups
              var length = attachments.length;

              // Assemble stats
              fields.push({
                title: 'Heard from',
                value: length + ' people',
                short: true
              });
              if (commonChannels.length >= 1) {
                fields.push({
                  title: 'Common projects',
                  value: commonChannels,
                  short: false
                });
              }
              if (pager.length >= 1) {
                fields.push({
                  title: 'Available today',
                  value: pager,
                  short: false
                });
              }

              // Add starter attachment
              attachments.unshift({
                fallback: 'Todays standup for <#'+channel.name+'>',
                pretext: audience+' Todays standup for <#'+channel.name+'>',
                title: 'Summary',
                fields: fields
              });
              callback(null);
            },

            // Send that report off to Slack
            function(callback) {
              report.attachments = attachments;
              anytimeBot.say(report, function(err, response) {
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
                  anytimeBot.say({
                    text: 'If you missed the standup, you can still submit! Just emoji '+
                      'one of my messages in the next few minutes and I\'ll include you',
                    channel: channel.name
                  });
                }
              });
              callback(null);
            }
          ]);
        });
      });
    }
  });
}

module.exports = function(anytimeBot) {
  return function() {
    runReports(anytimeBot);
  };
};
