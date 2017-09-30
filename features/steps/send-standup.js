const sinon = require('sinon');
const botLib = require('../../lib/bot');
const models = require('../../models');
const common = require('./common');

module.exports = function sendStandupTests() {
  const botMessage = { };
  let findOneChannelStub;
  let findOrCreateStub;
  let findOneStandupStub;
  let getUserStub;
  let updateStandupStub;
  let updateChannelStub;

  this.Given(/I want to send a standup for a ([^>]+) channel/, (visibility) => {
    if (visibility === 'public') {
      botMessage.channel = 'CSomethingSaySomething';
    } else {
      botMessage.channel = 'PnutButterJellyTime';
    }
  });

  this.Given(/^the channel (.+) have a standup/, (status) => {
    if (status === 'does') {
      findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({
        time: '130', name: 'CSomethingSaySomething', audience: null, latestReport: '123467.01'
      });
      findOrCreateStub = sinon.stub(models.Standup, 'findOrCreate').resolves({ });
      findOneStandupStub = sinon.stub(models.Standup, 'findOne').resolves({
        user: 'U00000000',
        userRealName: 'Bob the Tester',
        yesterday: 'In the past',
        today: 'Now',
        blockers: 'Barricades',
        goal: 'Accomplishments-to-be'
      });
    }
  });

  this.When(/^I DM the bot with standup$/, (message, done) => {
    botLib.getUserStandupInfo(common.botController);

    // getUserStub = sinon.stub(helpers, 'getUser').resolves({ real_name: 'Bob the Tester' });
    updateStandupStub = sinon.stub(models.Standup, 'update').resolves({ });

    botMessage.user = 'U7654321';
    botMessage.match = [
      `<#${botMessage.channel}> ${message}`, // whole message
      '', // optionally the word 'standup'
      botMessage.channel,
      '', // iOS channel tag has '|channelName' on the end
      message
    ];

    common.botRepliesToHearing(botMessage, done);
  });

  this.When(/^I DM the bot with (valid|invalid) standup edit$/, (valid, done) => {
    botLib.getUserStandupInfo(common.botController);

    botMessage.user = 'U7654321';
    botMessage.match = [
      `<#${botMessage.channel}> edit today`,
      '', // optionally the word 'standup'
      botMessage.channel,
      '', // iOS channel tag has '|channelName' on the end
      'edit today'
    ];

    if (valid === 'valid') {
      common.botStartsConvoWith(botMessage, common.botController.hears, done);
    } else {
      common.botRepliesToHearing(botMessage, done);
    }
  });

  this.When('I edit a DM to the bot to say', (message, done) => {
    botLib.getUserStandupInfo(common.botController);
    // getUserStub = sinon.stub(helpers, 'getUser').resolves({ real_name: 'Bob the Tester' });
    updateChannelStub = sinon.stub(models.Channel, 'update').resolves({ });

    common.botRepliesToHearing({
      type: 'message',
      message: {
        type: 'message',
        user: 'U00000000',
        text: `<#${botMessage.channel}> ${message}`,
        edited: { user: 'U00000000', ts: '1234567890.000000' },
        ts: '1234567890.000000'
      },
      subtype: 'message_changed',
      hidden: true,
      channel: 'Dchannel',
      previousbotMessage: {
        type: 'message',
        user: 'U00000000',
        text: 'Not really relevant...',
        ts: '1234567890.000000'
      },
      event_ts: '1234567890.000000',
      ts: '1234567890.000000'
    }, common.botController.on, done);
  });

  this.After(() => {
    if (findOneChannelStub) {
      findOneChannelStub.restore();
      findOneChannelStub = null;
    }
    if (findOrCreateStub) {
      findOrCreateStub.restore();
      findOrCreateStub = null;
    }
    if (findOneStandupStub) {
      findOneStandupStub.restore();
      findOneStandupStub = null;
    }
    if (updateStandupStub) {
      updateStandupStub.restore();
      updateStandupStub = null;
    }
    if (getUserStub) {
      getUserStub.restore();
      getUserStub = null;
    }
    if (updateChannelStub) {
      updateChannelStub.restore();
      updateChannelStub = null;
    }
  });
};
