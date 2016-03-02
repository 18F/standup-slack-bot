'use strict';

var models = require('../../models');
var timeHelper = require('../helpers').time;
var badStandupResponse = require('./replyToBadStandup');

function createStandup(bot, message) {
  if (message.channel[0] === 'C') {
    var time = timeHelper.getTimeFromString(message.match[2]);

    if(time) {
      models.Channel.findOrCreate({
        where: {
          name: message.channel
        }
      }).then(function () {
        models.Channel.update(
          {
            time: timeHelper.getScheduleFormat(time)
          },
          {
            where: {
              name: message.channel
            }
          }
        );
        return bot.reply(message,
          'Got it. Standup scheduled for '+timeHelper.getDisplayFormat(time)
        );
      });
    } else {
      return badStandupResponse(bot, message, time);
    }
  } else {
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], createStandup);
}

module.exports = attachListener;
