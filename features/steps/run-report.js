const sinon = require('sinon');
const common = require('./common');
const time = require('./time');
const models = require('../../models');
const reportRunner = require('../../lib/bot/getReportRunner');

module.exports = function runReportTests() {
  let findAllChannelsStub;
  let findOneChannelStub;
  let findAllStandupsStub;
  let bot;

  this.When('the scheduled time comes', () => {
    // Stub the models.Channel and models.Standup findAll
    // methods so we can guarantee behavior without worrying
    // about database contents.
    findAllChannelsStub = sinon.stub(models.Channel, 'findAll');
    findAllChannelsStub.resolves([{
      name: 'Test Channel',
      audience: null
    }]);

    findOneChannelStub = sinon.stub(models.Channel, 'findOne');
    findOneChannelStub.resolves({
      name: 'Test Channel',
      audience: null
    });

    findAllStandupsStub = sinon.stub(models.Standup, 'findAll');
    findAllStandupsStub.resolves([{
      user: 'U00000000',
      userRealName: 'Bob the Tester',
      yesterday: 'In the past',
      today: 'Now',
      blockers: 'Barricades',
      goal: 'Accomplishments-to-be'
    }]);

    // Also stub the bot
    bot = { };
    bot.say = sinon.spy();

    // Kick off the reporter
    reportRunner(bot)();

    // If fake timers have been setup, reset them now.
    // Otherwise, setTimeout won't behave correctly (i.e.,
    // at all).
    time.resetTimers();
  });

  this.Then('the bot should report', (done) => {
    // Wait until the findAll and say stubs have been called
    common.wait(() => findAllChannelsStub.called && findAllChannelsStub.called && bot.say.called, () => {
      // If the bot sent attachments, it tried to
      // report correctly.
      if (bot.say.args[0][0].attachments.length) {
        done();
      } else {
        done(new Error('Expected bot to report with text and attachments'));
      }
    });
  });

  this.Then('the bot should not report', (done) => {
    // Wait a second to give the report runner time
    // to bail out.  Since it shouldn't be calling
    // anything, we can't just wait until things
    // have been called.
    setTimeout(() => {
      if (bot.say.called) {
        done(new Error('Expected bot not to report'));
      } else {
        done();
      }
    }, 1000);
  });

  // Teardown stubs
  this.After(() => {
    if (findAllChannelsStub) {
      findAllChannelsStub.restore();
    }
    if (findOneChannelStub) {
      findOneChannelStub.restore();
    }
    if (findAllStandupsStub) {
      findAllStandupsStub.restore();
    }
  });
};
