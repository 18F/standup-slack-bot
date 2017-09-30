

const log = require('../../getLogger')('reply to bad standup');

function reply(bot, message, time) {
  log.info('Responding to bad standup creation request');
  log.info(`"${message.text}"`);

  let detail = ' ';
  if (!time) {
    detail += 'I can\'t understand the time format.';
  }

  return bot.reply(
    message,
    `:x: Sorry, I couldn't understand that message.${detail}`
  );
}

module.exports = reply;
