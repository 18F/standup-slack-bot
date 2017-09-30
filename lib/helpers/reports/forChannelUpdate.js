const forChannel = require('./forChannel');

module.exports = (channel, standups) => {
  const report = forChannel(channel, standups);
  report.ts = channel.latestReport;
  report.attachments = JSON.stringify(report.attachments);
  return report;
};
