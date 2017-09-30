const models = require('../../models');
const timeHelper = require('./time');
const createNewChannelReport = require('./createNewChannelReport');
const updateChannelReport = require('./updateChannelReport');

module.exports = function doChannelReport(bot, channelName, update, userName, inActionCallback) {
  const actionCallback = inActionCallback || (() => {});
  let channel;

  models.Channel
    .findOne({
      where: { name: channelName }
    })
    .then((foundChannel) => {
      channel = foundChannel;
      return models.Standup.findAll({
        where: {
          channel: channel.name,
          date: timeHelper.getCurrentDate()
        }
      });
    })
    .then((standups) => {
      if (update) {
        updateChannelReport(bot, channel, standups, userName);
      } else {
        createNewChannelReport(bot, channel, standups);
      }
      actionCallback(null);
    });
};
