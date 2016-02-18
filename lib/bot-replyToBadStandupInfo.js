'use strict';

function reply(bot, message, frequency, time, weekday) {
  var detail = ' ';
  if(!frequency) {
    detail = 'I don\'t see a frequency. Please specify either weekly or daily.';
  }
  if(!time) {
    detail = 'I can\'t understand the time format.';
  }
  if(frequency === 'weekly' && !weekday) {
    detail = 'I don\'t see a weekday. Please specify a weekday for weekly standups.';
  }

  return bot.reply(message,
    'Sorry, I couldn\'t understand that message.'+detail
  );
}

module.exports = reply;
