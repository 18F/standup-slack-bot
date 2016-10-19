'use strict';

var log = require('../../getLogger')('reminder runner');
var _ = require('underscore');
var models = require('../../models');
var helpers = require('../helpers');
var fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
  var time = helpers.time.getScheduleFormat();

  // Don't run if today is a federal holiday
  if(fedHolidays.isAHoliday()) {
    return;
  }

  // Find channels that want a reminder at this minute
  models.Channel.findAll({
    where: {
      reminderTime: time
    }
  }).then(function (channels) {
    if(channels.length > 0) {
      log.info('Sending reminders for ' + channels.length + ' channel(s)');

      // Iterate over the channels
      _.each(channels, function(channel) {
        // Set report audience
        var audience = channel.audience === null ? '<!here>' : '@'+channel.audience ;

        var reminder = {
          text: audience+' :hourglass: There\'s a standup in '+channel.reminderMinutes+' minutes! '+
            'To submit your standup, DM me! Or, add any emoji to this message and I\'ll DM you to get your standup info.',
          attachments: [],
          channel: channel.name
        };
        anytimeBot.say(reminder);
      });
    }
  });
}

module.exports = function(anytimeBot) {
  return function() {
    runReports(anytimeBot);
  };
};
