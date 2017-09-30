const log = require('../../getLogger')('join channel');

module.exports = (controller, botName) => {
  controller.on('bot_channel_join', (bot, message) => {
    log.info(`Joined channel ${message.channel}`);
    return bot.reply(message, {
      text: `:wave: Hi! To set up a standup, say \`@${botName} create standup [time]\`\n` +
        `For more information, say \`@${botName} help\``
    });
  });
  log.verbose('Attached');
};
