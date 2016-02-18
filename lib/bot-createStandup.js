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
    models.Channel.findOrCreate({
      where: {
        name: message.channel
      }
    }).then(function () {
      models.Channel.update(
        {
          frequency: frequency,
          day: weekday,
          time: moment(time).format('HHmm')
        },
        {
          where: {
            name: message.channel
          }
        }
      );
      return bot.reply(message,
        'Got it. Standup scheduled '+frequency+' at '+moment(time).format('hh:mm a')+' '+weekday
      );
    });
  } else {
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], createStandup);
}

module.exports = attachListener;
