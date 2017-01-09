'use strict';

const async               = require('async');
const models              = require('../../models');
const timeHelper          = require('./time');
const createNewChannelReport  = require('./createNewChannelReport');
const updateChannelReport     = require('./updateChannelReport');

module.exports = function doChannelReport(bot, channelName, update, userName, actionCallback) {
  actionCallback = actionCallback || function () {};

  let channel;

  models.Channel
    .findOne({
      where: {name: channelName}
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
            updateChannelReport(bot, channel, standups, userName);
          } else {
            createNewChannelReport(bot, channel, standups);
          }
          callback(null);
        }, actionCallback
      ]);
    });
};
