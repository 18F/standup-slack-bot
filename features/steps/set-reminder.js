const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function setReminderTests() {
  const botMessage = { };

  this.When(
    /I say "@bot ((reminder) (.*))"/,
    (message, triggerWord, rest, done) => {
      botLib.setReminder(common.botController);

      botMessage.type = 'message';
      botMessage.text = message;
      botMessage.channel = botMessage.channel || 'CSomethingSaySomething';
      botMessage.match = [
        message,
        triggerWord,
        rest
      ];

      common.botRepliesToHearing(botMessage, done);
    }
  );
};
