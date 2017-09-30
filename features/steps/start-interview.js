const sinon = require('sinon');
const models = require('../../models');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function startInterviewTests() {
  const botMessage = { };

  let findAllStandupsStub;
  let findOneChannelStub;

  const clearStubs = () => {
    if (findOneChannelStub) {
      findOneChannelStub.restore();
      findOneChannelStub = null;
    }
    if (findAllStandupsStub) {
      findAllStandupsStub.restore();
      findAllStandupsStub = null;
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

    findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([]);
    findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '1230', name: message.channel, audience: null });

    common.botStartsConvoWith(message, common.botController.hears, () => {
      clearStubs();
      done();
    });
  });

  this.When(
    /I say "(@bot\b.*\binterview\b.*)"/,
    (message, done) => {
      botLib.startInterview(common.botController);

      botMessage.user = 'U7654321';
      botMessage.type = 'message';
      botMessage.text = message;
      botMessage.channel = botMessage.channel || 'CSomethingSaySomething';

      findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([]);
      findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '1230', name: botMessage.channel, audience: null });
      common.botStartsConvoWith(botMessage, common.botController.hears, done);
    }
  );

  this.After(clearStubs);
};
