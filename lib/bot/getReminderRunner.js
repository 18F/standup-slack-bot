'use strict';

var log = require('../../getLogger')('reminder runner');
var _ = require('underscore');
var models = require('../../models');
var helpers = require('../helpers');
var fedHolidays = require('@18f/us-federal-holidays');
const messageBuilder = require('./message-builders');

function runReports(anytimeBot) {
  var time = helpers.time.getScheduleFormat();

  // Don't run if today is a federal holiday
  if(fedHolidays.isAHoliday()) {
    return;
  }

  // Find channels that want a reminder at this minute
  var where = {
    reminderTime: time
  };
  where[helpers.time.getScheduleDay()] = true;

  models.Channel.findAll({
    where: where
  }).then(function (channels) {
    if(channels.length > 0) {
      log.info('Sending reminders for ' + channels.length + ' channel(s)');

      // Iterate over the channels
      _.each(channels, function(channel) {
        // Set report audience
        var audience = channel.audience === null ? '<!here>' : '@'+channel.audience ;

        var reminder = messageBuilder.reminder(audience, channel.reminderMinutes, channel.name);
        anytimeBot.say(reminder, function(err, response) {
          if(!err && !process.env.IS_APP) {
            anytimeBot.api.reactions.add({
              name: 'wave',
              channel: channel.name,
              timestamp: response.message.ts
            });
          }
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
