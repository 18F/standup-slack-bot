'use strict';

var log = require('../../getLogger')('remove standup');
var models = require('../../models');

function removeStandup(bot, message) {
  log.verbose('Heard a request to remove a standup: \n' + message.match[0]);
  models.Channel.find({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    if (channel) {
      channel.destroy().then(function() {
        log.info('Channel removed: '+channel);
        bot.reply(message, 'Standup removed :thumbsup:');
      });
    } else {
      bot.reply(message, 'This channel doesn\'t have a standup scheduled');
    }
  });
}

function attachListener(controller) {
  controller.hears(['(remove|delete) standup'],['direct_mention'], removeStandup);
  log.verbose('Attached');
}

module.exports = attachListener;
