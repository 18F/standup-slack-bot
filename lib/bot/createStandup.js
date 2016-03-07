'use strict';

var log = require('../../getLogger')('create standup');
var models = require('../../models');
var timeHelper = require('../helpers').time;
var badStandupResponse = require('./replyToBadStandup');

function createStandup(bot, message) {
  log.verbose('Heard a request to create a standup:\n' + message.match[0]);
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
        log.info('Standup scheduled for ' + message.channel + ' at ' + timeHelper.getDisplayFormat(time));
        return bot.reply(message,
          'Got it. Standup scheduled for '+timeHelper.getDisplayFormat(time)
        );
      });
    } else {
      return badStandupResponse(bot, message, time);
    }
  } else {
    log.warn('Channel is not public');
    return bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], createStandup);
  log.verbose('Attached');
}

module.exports = attachListener;
