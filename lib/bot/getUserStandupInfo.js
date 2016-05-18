'use strict';

var log = require('../../getLogger')('get user standup');
var moment = require('moment');
var helpers = require('../helpers');
var models = require('../../models');

function getUserStandupInfo(bot, message) {
  var standupChannel = message.match[2];
  var content = message.match[4];
  if (standupChannel[0] === 'C'){
    if (content.length > 0) {
      helpers.doBlock(bot, message, standupChannel, message.user);
    } else {
      helpers.doInterview(bot, standupChannel, message.user);
    }
  } else {
    log.warn('Channel is not public');
    bot.reply(message, 'I can only work with public channels. Sorry!');
  }
}

function attachListener(controller) {
  // TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
  // TODO: update reports when edited
  // TODO: parse standup messages
  controller.hears(['^(standup )?<#(\\S*?)(\\|\\S*)?>((.|\n)*)'],['direct_message'], getUserStandupInfo);
  controller.on('message_changed', function(bot, m) {
    var msg = m.message;
    m.user = m.message.user;
    m.match = m.message.text.match(/(standup )?<#(\S*?)(\|\S*)?>((.|\n)*)/);
    if(m.match && m.channel[0] === 'D') {
      getUserStandupInfo(bot, m);
    }
  });
  log.verbose('Attached');
}

module.exports = attachListener;
