'use strict';

const log                 = require('../../getLogger')('channel report');
const async               = require('async');
const _                   = require('underscore');
const models              = require('../../models');
const timeHelper          = require('./time');
const convertStandups     = require('./reports/convertStandups');
const generateFields      = require('./reports/generateFields');

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

      var attachments = convertStandups(standups);
      attachments.unshift({
        fallback: 'Todays standup for <#'+channel.name+'>',
        pretext: 'Todays standup for <#'+channel.name+'>',
        title: 'Summary',
        fields: generateFields(attachments)
      });

      async.series([
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
