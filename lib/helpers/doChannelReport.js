'use strict';

const async               = require('async');
const models              = require('../../models');
const timeHelper          = require('./time');
const createNewChannelReport  = require('./createNewChannelReport');
const updateChannelReport     = require('./updateChannelReport');

module.exports = function doChannelReport(bot, reportChannel, update, userRealName, actionCallback) {
  actionCallback = actionCallback || function () {};

  var teamDomain;
  if (update) {
    bot.api.team.info({}, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        teamDomain = response.team.domain;
      }
    });
  }

  let channel;

  models.Channel
    .findOne({
      where: {name: reportChannel}
    })
    .then(function(foundChannel) {
      channel = foundChannel;
      return models.Standup.findAll({
        where: {
          channel: channel.name,
          date: timeHelper.getCurrentDate()
        }
      });
    })
    .then(function (standups) {
      async.series([
        function(callback) {
          if (update) {
            updateChannelReport(bot, channel, standups, userRealName, teamDomain);
          } else {
            createNewChannelReport(bot, channel, standups);
          }
          callback(null);
        }, actionCallback
      ]);
    });
};
