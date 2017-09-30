const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function userReportTests() {
  const botMessage = { };

  this.When(/I say "@bot ((report) (.*))"/, (message, triggerWord, rest, done) => {
    botLib.userReport(common.botController);

    botMessage.type = 'message';
    botMessage.text = message;
    botMessage.channel = botMessage.channel || 'CSomethingSaySomething';
    botMessage.user = botMessage.user || 'Somebody';
    botMessage.match = [
      message,
      triggerWord,
      rest
    ];

    common.botRepliesToHearing(botMessage, done);
  });
};
