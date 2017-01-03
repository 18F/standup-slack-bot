'use strict';
const fs = require('fs');
const mustache = require('mustache');
const timezone = process.env.TIMEZONE || 'America/New_York';
const log = require('../../getLogger')('help giver');

const overviewDoc = fs.readFileSync('./documentation/overview.md', { encoding: 'utf-8' });

function attachListener(controller, botName) {
  controller.hears(['^(help|usage)'],['direct_mention','direct_message'], function(bot, message) {
    let fullHelp = '';
    if(process.env.URL) {
      fullHelp = `Here's some helpful tips.  You can also check out my [full standup-bot documentation](${process.env.URL}).\n\n`;
    }
    const helpFile = mustache.render(overviewDoc, { bot_name: botName, timezone, full_help: fullHelp });

    bot.api.files.upload({
      title:'standup-bot help',
      filename: 'standup-bot-help.md',
      filetype: 'post',
      content: helpFile,
      channels: message.channel
    }, function(err) {
      if(err) {
        log.error(err);
      }
    });
  });
}

module.exports = attachListener;
