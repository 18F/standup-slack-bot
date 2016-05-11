'use strict';

var log = require('../../getLogger')('report runner');
// var asyncLib = require('async');
var _ = require('underscore');
// var moment = require('moment');
var models = require('../../models');
var helpers = require('../helpers');
var fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
  var time = helpers.time.getScheduleFormat();
  // var date = helpers.time.getCurrentDate();

  // Don't run if today is a federal holiday
  if(fedHolidays.isAHoliday()) {
    return;
  }

  models.Channel.findAll({
    where: {
      time: time
    }
  }).then(function (channels) {
    if(channels.length > 0) {
      log.info('Reporting standups for ' + channels.length + ' channel(s)');

      // Iterate over the channels
      _.each(channels, function(channel) {
        helpers.doChannelReport(anytimeBot, channel.name, false);
      });
    }
  });
}

module.exports = function(anytimeBot) {
  return function() {
    runReports(anytimeBot);
  };
};
