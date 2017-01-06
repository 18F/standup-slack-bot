const log = require('../../../getLogger')('slack web | start standup interview');
const botHelpers = require('../../helpers');

module.exports = function submitStandup(bot, message) {
  log.verbose(`User ${message.user} clicked the "start interview" button in channel ${message.channel}`);
  bot.replyInteractive(message, {
    replace_original: false,
    delete_original: false,
    response_type: 'ephemeral',
    text: `Okay, I'll DM you!`
  });
  botHelpers.doInterview(bot, message.channel, message.user);
};
