
const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');
const models = require('../../models');

module.exports = function createStandupTests() {
  const botMessage = { };
  let channelFindOrCreateStub = null;

  this.Given('I am in a private room with the bot', () => {
    botLib.createStandup(common.botController);
    botMessage.channel = 'PnutButterJellyTime';
  });

  this.When(
    /I say "@bot ((create|schedule) (standup .*))"/,
    (message, triggerWord, rest, done) => {
      botLib.createStandup(common.botController);

      botMessage.type = 'message';
      botMessage.text = message;
      botMessage.channel = botMessage.channel || 'CSomethingSaySomething';
      botMessage.match = [
        message,
        triggerWord,
        rest
      ];

      channelFindOrCreateStub = sinon.stub(models.Channel, 'findOrCreate').resolves([{ name: message.channel }]);
      common.botRepliesToHearing(botMessage, done);
    }
  );

  this.After(() => {
    if (channelFindOrCreateStub) {
      channelFindOrCreateStub.restore();
      channelFindOrCreateStub = null;
    }
  });
};
