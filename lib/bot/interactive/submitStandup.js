const log = require('../../../getLogger')('slack web | start standup interview');
const botHelpers = require('../../helpers');

module.exports = function submitStandup(bot, message) {
  log.verbose(`User ${message.user} clicked the "start interview" button in channel ${message.channel}`);

  if(userHasAlreadyClicked(message.user, message.channel)) {
    console.log('They already clicked this one!')
    bot.replyInteractive(message, {
      replace_original: false,
      delete_original: false,
      response_type: 'ephemeral',
      text: `Okay, I'll DM you!`
    });
  } else {
    bot.replyInteractive(message, {
      replace_original: false,
      delete_original: false,
      response_type: 'ephemeral',
      text: `Okay, I'll DM you!`
    });
    //botHelpers.doInterview(bot, message.channel, message.user);
  }
};
