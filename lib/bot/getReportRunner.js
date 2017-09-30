

const log = require('../../getLogger')('report runner');
const _ = require('underscore');
const models = require('../../models');
const helpers = require('../helpers');
const fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
  const time = helpers.time.getScheduleFormat();

  // Don't run if today is a federal holiday
  if (fedHolidays.isAHoliday()) {
    return;
  }

  const where = {
    time
  };
  where[helpers.time.getScheduleDay()] = true;

  models.Channel.findAll({
    where
  }).then((channels) => {
    if (channels.length > 0) {
      log.info(`Reporting standups for ${channels.length} channel(s)`);

      // Iterate over the channels
      _.each(channels, (channel) => {
        helpers.doChannelReport(anytimeBot, channel.name, false);
      });
    }
  });
}

module.exports = function (anytimeBot) {
  return function () {
    runReports(anytimeBot);
  };
};
