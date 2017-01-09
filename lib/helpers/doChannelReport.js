'use strict';

var log             = require('../../getLogger')('channel report');
var async           = require('async');
var _               = require('underscore');
var models          = require('../../models');
var timeHelper      = require('./time');
var standupHelper   = require('./getStandupReport');

module.exports = function doChannelReport(bot, reportChannel, update, userRealName, actionCallback) {
  actionCallback = actionCallback || function () {};
  var date = timeHelper.getCurrentDate();
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

  models.Channel.findOne({
    where: {
      name: reportChannel
    }
  }).then(function(channel) {

    // Set report audience
    // var audience = channel.audience === null ? '<!here>' : channel.audience;
    // if (audience.search(/<!/) !== 0) {
    //   audience = '@'+audience;
    // }

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
      async.series([
        // Iterate over this channels standup messages
        // syncronous operation, does not need to be inside async
        function(callback) {
          _.each(standups, function (standup) {
            attachments.push(standupHelper(standup));
          });
          callback(null);
        },

        // syncronous operation, does not need to be inside async
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
          // Find people who are out of office (OOO) today
          var pager = '';
          var ooo = '';
          for (let attachment of attachments) {
            for (let field of attachment.fields) {
              if (field.title === 'Today') {
                if (field.value.search(/:pager:/) >= 0) {
                  pager += '- '+attachment.title + '\n';
                }
                if (field.value.toLowerCase() === 'ooo' || field.value.toLowerCase() === 'out of office') {
                  ooo += '- '+attachment.title + '\n';
                }
              }
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
              title: 'Available today :pager:',
              value: pager,
              short: false
            });
          }
          if (ooo.length >= 1) {
            fields.push({
              title: 'Out today',
              value: ooo,
              short: false
            });
          }

          // Add starter attachment
          attachments.unshift({
            fallback: 'Todays standup for <#'+channel.name+'>',
            pretext: 'Todays standup for <#'+channel.name+'>',
            title: 'Summary',
            fields: fields
          });
          callback(null);
        },

        // Send that report off to Slack
        function(callback) {
          if (!update) {
            report.attachments = attachments;
            log.verbose('Sending report for '+channel.name);
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
          } else {
            report.ts = channel.latestReport;
            report.attachments = JSON.stringify(attachments);
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
        callback(null);
        }, actionCallback
      ]);
    });
  });
};
