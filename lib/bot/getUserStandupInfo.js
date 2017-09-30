

const log = require('../../getLogger')('get user standup');
const moment = require('moment');
const helpers = require('../helpers');
const models = require('../../models');

function getUserStandupInfo(bot, message) {
  const standupChannel = message.match[2];
  let content = message.match[4];
  let section;
  const sectionMatch = content ? content.match(/edit\s+(yesterday|today|blockers|goal)/i) : false;

  if (sectionMatch) {
    section = sectionMatch[1].toLowerCase();
    content = '';
  }

  if (standupChannel[0] === 'C') {
    models.Channel.findOne({
      where: {
        name: standupChannel
      }
    }).then((channel) => {
      if (channel) {
        if (content.length > 0) {
          helpers.doBlock(bot, message, standupChannel, message.user);
        } else {
          helpers.doInterview(bot, standupChannel, message.user, section);
        }
      } else {
        log.info('Channel doesn\'t have a standup scheduled');
        bot.reply(
          message,
          `The <#${standupChannel}> channel doesn't have any standups set`
        );
      }
    });
  } else {
    log.warn('Channel is not public');
    bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  // TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
  // TODO: update reports when edited
  // TODO: parse standup messages
  controller.hears(['^(standup )?<#(\\S*?)(\\|\\S*)?>((.|\n)*)'], ['direct_message'], getUserStandupInfo);
  controller.on('message_changed', (bot, m) => {
    const msg = m.message;
    m.user = m.message.user;
    m.match = m.message.text.match(/(standup )?<#(\S*?)(\|\S*)?>((.|\n)*)/);
    if (m.match && m.channel[0] === 'D') {
      getUserStandupInfo(bot, m);
    }
  });
  log.verbose('Attached');
}

module.exports = attachListener;
