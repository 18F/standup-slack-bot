const log = require('../../getLogger')('set in-channel updates');
const models = require('../../models');

function toggleUpdates(bot, message, newValue) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then((channel) => {
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
      ).then(() => {
        bot.reply(message, `Okay, I ${newValue ? 'will' : 'won\'t'} update the channel with late reports`);
      });
    } else {
      bot.reply(
        message,
        'There\'s no standup scheduled for this channel yet!'
      );
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
  controller.hears(['(en|dis)able updates'], ['direct_mention'], (bot, message) => {
    if (message.match[0].toLowerCase().startsWith('enable')) {
      enableUpdates(bot, message);
    } else {
      disableUpdates(bot, message);
    }
  });
  log.verbose('Attached');
}

module.exports = attachListener;
