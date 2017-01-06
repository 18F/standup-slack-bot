const botHelpers = require('../../helpers');
const messageBuilder = require('../message-builders');

module.exports = function(slashCommand, message) {
  if(message.text.startsWith('create ') || message.text.startsWith('schedule ')) {
    const schedule = botHelpers.time.getTimeFromString(message.text);
    if(schedule) {
      slashCommand.replyPrivate(message, messageBuilder.standupConfig(schedule, null, 0, message.channel));
    } else {
      slashCommand.replyPrivate(message, 'Time :(');
    }
  } else {
    slashCommand.replyPrivate(message, `Iz broke`);
  }
}
