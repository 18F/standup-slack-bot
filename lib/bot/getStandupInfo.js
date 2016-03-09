'use strict';

var models = require('../../models');
var timeHelper = require('../helpers').time;

function GetStandupInfo(bot, message) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    if (channel) {
      bot.reply(message, 'There\'s a standup scheduled for '+
        timeHelper.getDisplayFormat(channel.time));
    } else {
      bot.reply(message, 'There\'s no standup scheduled yet.');
    }
  });
}

function attachListener(controller) {
  controller.hears(['^when'],['direct_mention'], GetStandupInfo);
}

module.exports = attachListener;
