'use strict';

var models = require('../models');
var timeHelper = require('./helper-time');

function createStandup(bot, message) {
  if (message.channel[0] === 'C') {
    var frequency = '';
    var weekday = '';
    var time = timeHelper.getTimeFromString(message.match[2]);
    if (message.match[2].match(/daily/)) {
      frequency = 'daily';
    } else if (message.match[2].match(/weekly/)) {
      frequency = 'weekly';
      weekday = message.match[2].match(/(\w)*day/i);
    }

    if(frequency && time && (frequency === 'daily' || weekday)) {
      models.Channel.findOrCreate({
        where: {
          name: message.channel
        }
      }).then(function () {
        models.Channel.update(
          {
            frequency: frequency,
            day: weekday,
            time: timeHelper.getScheduleFormat(time)
          },
          {
            where: {
              name: message.channel
            }
          }
        );
        return bot.reply(message,
          'Got it. Standup scheduled '+frequency+' at '+
            timeHelper.getDisplayFormat(time)+' '+weekday
        );
      });
    } else {
      var detail = ' ';
      if(!frequency) {
        detail = 'I don\'t see a frequency. Please specify either weekly or daily.';
      }
      if(!time) {
        detail = 'I can\'t understand the time format.';
      }
      if(frequency === 'weekly' && !weekday) {
        detail = 'I don\'t see a weekday. Please specify a weekday for weekly standups.';
      }

      return bot.reply(message,
        'Sorry, I couldn\'t understand that message.'+detail
      );
    }
  } else {
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], createStandup);
}

module.exports = attachListener;
