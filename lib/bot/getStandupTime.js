'use strict';

var log = require('../../getLogger')('get standup time');
var moment = require('moment');
var models = require('../../models');
var helpers = require('../helpers');

function getStandupTime(bot, message) {
  log.verbose('Asked for next standup time');
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(function(channel) {
    var response = '';

    if(channel && channel.time) {
      // Time has to be 4 digits for moment
      // to parse it properly
      var time = String(channel.time);
      if(time.length < 4) {
        time = '0' + time;
      }
      time = moment.utc(time, 'HHmm');

      var dispTime = helpers.time.getDisplayFormat(time);
      response = 'The next standup is scheduled for ' + dispTime;

      if(Number(time.format('HHmm')) < Number(moment.utc().format('HHmm'))) {
        response += ' tomorrow';
      } else {
        response += ' today';
      }
    } else {
      response = 'No standup currently scheduled';
    }

    bot.reply(message, response);
  });
}

function attachListener(controller) {
  controller.hears(['^(standup )?time(.*)'], ['direct_mention'], getStandupTime);
  log.verbose('Attached');
}

module.exports = attachListener;
