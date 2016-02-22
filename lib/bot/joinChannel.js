'use strict';

module.exports = function(controller, botName) {
  controller.on('bot_channel_join', function (bot, message) {
    return bot.reply(message, {
      text: 'Hi! To set up a standup, say `@'+botName+' create standup [daily/weekly] [time]`'
    });
  });
};
