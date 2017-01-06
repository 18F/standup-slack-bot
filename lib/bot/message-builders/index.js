const reminder = require('./reminder');
const standupConfig = require('./standup-config');

if(process.env.IS_APP) {
  module.exports = {
    reminder: reminder.slackapp,
    standupConfig: standupConfig.slackapp
  };
} else {
  module.exports = {
    reminder: reminder.standalone,
    standupConfig: standupConfig.standalone
  };
};
