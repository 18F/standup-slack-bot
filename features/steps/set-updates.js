const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function setUpdatesTest() {
  const botMessage = { };

  this.When(
    /I say "@bot ((.*)?(en|dis)able updates)"/,
    (message, maybeStuffBefore, enOrDis, done) => {
      botLib.setInChannelUpdate(common.botController);

      botMessage.type = 'message';
      botMessage.text = message;
      botMessage.match = message.match(/(en|dis)able updates/i);
      botMessage.channel = botMessage.channel || 'CSomethingSaySomething';

      common.botRepliesToHearing(botMessage, done);
    }
  );
};
