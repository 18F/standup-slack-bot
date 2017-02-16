'use strict';

const forChannel = require('./forChannel');

module.exports = function(channel, standups) {
  let report = forChannel(channel, standups);
  report.ts = channel.latestReport;
  report.attachments = JSON.stringify(report.attachments);
  return report;
};
