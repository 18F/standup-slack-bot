

const forChannel = require('./forChannel');

module.exports = function (channel, standups) {
  const report = forChannel(channel, standups);
  report.ts = channel.latestReport;
  report.attachments = JSON.stringify(report.attachments);
  return report;
};
