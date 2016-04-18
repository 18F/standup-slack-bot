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
        var audience = channel.audience === null ? '<!here>' : '@'+channel.audience.replace('@','') ;

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
            text: audience+' Todays standup for <#'+channel.name+'>:',
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
