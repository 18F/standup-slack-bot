'use strict';

function reply(bot, message, time) {
  var detail = ' ';
  if(!time) {
    detail = 'I can\'t understand the time format.';
  }

  return bot.reply(message,
    'Sorry, I couldn\'t understand that message.'+detail
  );
}

module.exports = reply;
