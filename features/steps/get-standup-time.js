const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');
const models = require('../../models');

module.exports = function getStandupTimeTests() {
  let channelFindStub = null;
  const channelFindResolves = {
    get() {
      return false;
    }
  };

  // TODO: move these functions to common.js
  this.Given(/the standup is scheduled for ([1-2]?\d:[0-5]\d [ap]m)/, (time) => {
    const plus12 = time.substr(-2, 2) === 'pm' ? 1200 : 0;
    const scheduledTime = Number(time.replace(':', '').substr(0, 4).trim()) + plus12;

    channelFindResolves.time = scheduledTime;
    if (!channelFindStub) {
      channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(channelFindResolves);
    }
  });

  this.Given(/the standup is scheduled on (.*)/, (daysFromSetup) => {
    const days = daysFromSetup.split(' ').map(day => day.toLowerCase());
    channelFindResolves.get = dayName => days.indexOf(dayName.toLowerCase()) >= 0;

    if (!channelFindStub) {
      channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(channelFindResolves);
    }
  });

  // TODO: move these functions to common.js
  this.Given('no standup is scheduled', () => {
    channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(null);
  });

  this.When(/I say "@bot when"/, (done) => {
    botLib.getStandupInfo(common.botController);

    const message = {
      type: 'message',
      text: 'standup time',
      channel: 'CSomethingSaySomething'
    };

    common.botRepliesToHearing(message, done);
  });

  this.After(() => {
    if (channelFindStub) {
      channelFindStub.restore();
      channelFindStub = null;
    }
  });
};
