const sinon = require('sinon');
const models = require('../../models');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function removeStandupTests() {
  const botMessage = { };
  let channelDestroyStub = null;

  this.When(
    /I say "@bot ((remove|delete) (standup))"/,
    (message, triggerWord, rest, done) => {
      botLib.removeStandup(common.botController);

      botMessage.type = 'message';
      botMessage.text = message;
      botMessage.channel = botMessage.channel || 'CSomethingSaySomething';
      botMessage.match = [
        message,
        triggerWord,
        rest
      ];

      channelDestroyStub = sinon.stub(models.Channel, 'destroy').resolves({ });
      common.botRepliesToHearing(botMessage, done);
    }
  );

  this.After(() => {
    if (channelDestroyStub) {
      channelDestroyStub.restore();
      channelDestroyStub = null;
    }
  });
};
