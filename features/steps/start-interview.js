
const sinon = require('sinon');
const models = require('../../models');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function () {
  const _message = { };

  let _findAllStandupsStub;
  let _findOneChannelStub;
  const _expectConvo = true;

  const clearStubs = function () {
    if (_findOneChannelStub) {
      _findOneChannelStub.restore();
      _findOneChannelStub = null;
    }
    if (_findAllStandupsStub) {
      _findAllStandupsStub.restore();
      _findAllStandupsStub = null;
    }
  };

  this.When('I am already being interviewed for another channel', (done) => {
    botLib.startInterview(common.botController);

    const message = {
      user: 'U7654321',
      type: 'message',
      text: '@bot interview me',
      channel: 'COtherChannel'
    };

    _findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([]);
    _findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '1230', name: message.channel, audience: null });

    common.botStartsConvoWith(message, common.botController.hears, () => {
      clearStubs();
      done();
    });
  });

  this.When(
    /I say "(@bot\b.*\binterview\b.*)"/,
    (message, done) => {
      botLib.startInterview(common.botController);

      _message.user = 'U7654321';
      _message.type = 'message';
      _message.text = message;
      _message.channel = _message.channel || 'CSomethingSaySomething';

      _findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([]);
      _findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '1230', name: _message.channel, audience: null });
      common.botStartsConvoWith(_message, common.botController.hears, done);
    }
  );

  this.After(clearStubs);
};
