
const sinon = require('sinon');
const models = require('../../models');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function () {
  const _message = { };
  let _channelDestroyStub = null;

  this.When(
    /I say "@bot ((remove|delete) (standup))"/,
    (message, triggerWord, rest, done) => {
      botLib.removeStandup(common.botController);

      _message.type = 'message';
      _message.text = message;
      _message.channel = _message.channel || 'CSomethingSaySomething';
      _message.match = [
        message,
        triggerWord,
        rest
      ];

      _channelDestroyStub = sinon.stub(models.Channel, 'destroy').resolves({ });
      common.botRepliesToHearing(_message, done);
    }
  );

  this.After(() => {
    if (_channelDestroyStub) {
      _channelDestroyStub.restore();
      _channelDestroyStub = null;
    }
  });
};
