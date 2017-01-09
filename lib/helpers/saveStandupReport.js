const log = require('../../getLogger')('save standup report');
const moment = require('moment');
const models = require('../../models');
const timeHelper = require('./time');
const standupHelper = require('./getStandupReport');

function getUserRealNameAndThumbnail(bot, user) {
  return new Promise((resolve, reject) => {
    bot.api.users.info({user}, function(err, response) {
      resolve({
        userRealName: response.user.real_name || response.user.name,
        thumbUrl: response.user.profile.image_72
      });
    });
  });
}

module.exports = function(bot, newOrUpdatedStandup) {
  let dbChannel;

  return getUserRealNameAndThumbnail(bot, newOrUpdatedStandup.user)
    .then(userNameAndThn => {
      newOrUpdatedStandup.userRealName = userNameAndThn.userRealName;
      newOrUpdatedStandup.thumbUrl = userNameAndThn.thumbUrl;
      return models.Standup.upsert(newOrUpdatedStandup)
    })
    .then(() => {
      return models.Channel.findOne({
        where: {
          name: newOrUpdatedStandup.channel
        }
      })
    })
    .then(channel => {
      dbChannel = channel;
    })
    .then(() => {
      return models.Standup.findOne({
        where: {
          channel: newOrUpdatedStandup.channel,
          date: timeHelper.getReportFormat(),
          user: newOrUpdatedStandup.user
        }
      })
    })
    .then(standup => {
      const now = timeHelper.getDisplayFormat();
      const channelTime = timeHelper.getDisplayFormat(dbChannel.time);

      if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
        log.verbose(`Standup info recorded for ${newOrUpdatedStandup.userRealName}`);
        return { standup, updatedExistingReport: false };
      } else {
        log.verbose(`Late report from ${newOrUpdatedStandup.userRealName}; updating previous report`);
        return { standup, updatedExistingReport: true };
      }
    });
};
