const botHelpers = require('../../helpers');

module.exports = function reminderStartInterview(bot, message) {
  bot.replyInteractive(message, {
    replace_original: false,
    delete_original: false,
    response_type: 'ephemeral',
    text: `Okay, I'll DM you!`
  });
  botHelpers.doInterview(bot, message.channel, message.user);
};
