'use strict';

var log = require('../../getLogger')('report runner');
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
        var report = {
          text: '<!here> :hourglass: There\'s a standup in '+channel.reminderMinutes+' minutes! '+
            'DM me to submit your info, or emoji this message and I\'ll contact you.',
          attachments: [],
          channel: channel.name
        };
        anytimeBot.say(report);
      });
    }
  });
}

module.exports = function(anytimeBot) {
  return function() {
    runReports(anytimeBot);
  };
};
