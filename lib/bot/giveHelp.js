'use strict';


function attachListener(controller, botName) {
  controller.hears(['^(help|usage)'],['direct_mention','direct_message'], function(bot, message) {
    var helpMessage =

      'To create a standup, say `@'+botName+' create standup [time]` in a channel\n'+
      'To create a reminder for that standup, say `@'+botName+' reminder [minutes before standup]`\n'+
      'To log your standup, either emoji that reminder or DM me with the following format '+
      '```#channel-name\ny: what I did yesterday\nT: what I\'m doing today\n'+
      'b: what\'s in my way\ng: what main thing I hope to accomplish```\n'+
      '- To remove a standup, say `@'+botName+' remove standup` in the channel where it\'s '+
      'scheduled\nBy default, notifications are sent with @-here, but you can change that to'+
      'something else—like a user group or @-channel—by saying `@'+botName+
      ' audience [notification]`\n'+
      '- To get a report of past standups, DM me with `report` or say `@'+botName+' report` in the '+
      'channel you\'re curious about. To customize that report,'+
      ' say any combination of `report [user] [channel] [days]`';

    if(process.env.URL) {
      helpMessage += '\n\nFor more help, see ' + process.env.URL;
    }

    bot.reply(message, helpMessage);
  });
}

module.exports = attachListener;
