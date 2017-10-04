'use strict';

var log = require('../../getLogger')('set in-channel updates');
var models = require('../../models');
var timeHelper = require('../helpers').time;

function toggleUpdates(bot, message, newValue) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    if (channel) {
      models.Channel.update(
        {
          postUpdatesInChannel: newValue
        },
        {
          where: {
            name: message.channel
          }
        }
      ).then(function() {
        bot.reply(message, `Okay, I ${newValue ? `will` : `won't`} update the channel with late reports`);
      });
    } else {
      bot.reply(message,
        'There\'s no standup scheduled for this channel yet!');
    }
  });
}

function enableUpdates(bot, message) {
  log.verbose('Heard a request to enable in-channel updates');
  toggleUpdates(bot, message, true);
}

function disableUpdates(bot, message) {
  log.verbose('Heard a request to disable in-channel updates');
  toggleUpdates(bot, message, false);
}

function attachListener(controller) {
  controller.hears(['(en|dis)able updates'],['direct_mention'], (bot, message) => {
    if(message.text.toLowerCase().startsWith('enable')) {
      enableUpdates(bot, message);
    } else {
      disableUpdates(bot, message);
    }
  });
  log.verbose('Attached');
}

module.exports = attachListener;
