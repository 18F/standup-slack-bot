'use strict';

var moment = require('moment')
var models = require('../models');

function attachListener(controller) {
  controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], createStandup);
}

function createStandup(bot, message) {
  if (message.channel[0] == 'C') {
    var frequency = '';
    var weekday = '';
    var time = message.match[2].match(/(\d+|:)*(\s)?((a|p)m)/gi);
    time = moment(time[0], ['h:mm a','hmm a','hmma','HHmm','hha','hh a']);
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

module.exports = attachListener;
