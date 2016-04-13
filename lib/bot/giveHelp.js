'use strict';


function attachListener(controller, botName) {
  controller.hears(['^(help|usage)'],['direct_mention','direct_message'], function(bot, message) {
    var helpMessage = 'To create a standup, say `@'+botName+' create standup [time]`\n'+
      'To create a reminder for that standup, say `@'+botName+' remind [minutes before standup]`\n'+
      'To log your standup, either emoji that reminder or DM me with the following format '+
      '```#channel-name\ny: what I did yesterday\nT: what I\'m doing today\n'+
      'b: what\'s in my way\ng: what main thing I hope to accomplish```\n'+
      'To remove a standup, say `@'+botName+' remove standup` in the channel where it\'s scheduled';

    bot.reply(message, helpMessage);
  });
}

module.exports = attachListener;
