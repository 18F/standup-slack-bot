const reminder = require('./reminder');

if(process.env.IS_APP) {
  module.exports = {
    reminder: reminder.slackapp
  };
} else {
  module.exports = {
    reminder: reminder.standalone
  };
};
