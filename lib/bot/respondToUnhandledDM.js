function attachListener(controller) {
  controller.hears([/.*/],['direct_message'], (bot, message) => {
    bot.reply(message, "Sorry, I don't understand that message.  If you need help, try just saying `help`.  If you're trying to submit your standup, try this:\n\nstandup #channelName\nY: what you did yesterday\nT: what you're doing today\nB: blockers\nG: goals\n\n(Each of those fields is optional, so only provide the ones you want!)");
  });
}

module.exports = attachListener;
