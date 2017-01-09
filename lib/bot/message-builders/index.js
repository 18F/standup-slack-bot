const reminder = require('./reminder');
const standupConfig = require('./standup-config');
const standupReport = require('./standup-report');

if(process.env.IS_APP) {
  module.exports = {
    reminder: reminder.slackapp,
    standupConfig: standupConfig.slackapp,
    standupReport
  };
} else {
  module.exports = {
    reminder: reminder.standalone,
    standupConfig: standupConfig.standalone,
    standupReport
  };
};
