const sinon = require('sinon');
const common = require('./common');
const models = require('../../models');
const time = require('./time');
const reminderRunner = require('../../lib/bot/getReminderRunner');

module.exports = function runReminderTests() {
  let findAllChannelsStub;
  let bot;

  this.When('the reminder time comes', () => {
    findAllChannelsStub = sinon.stub(models.Channel, 'findAll').resolves([{
      name: 'Test Channel',
      audience: null
    }]);

    // Also stub the bot
    bot = { };
    bot.say = sinon.spy();

    // Kick off the reporter
    reminderRunner(bot)();

    // If fake timers have been setup, reset them now.
    // Otherwise, setTimeout won't behave correctly (i.e.,
    // at all).
    time.resetTimers();
  });

  this.Then('the bot should send a reminder', (done) => {
    // Wait until the findAll and say stubs have been called
    common.wait(() => findAllChannelsStub.called && bot.say.called, () => {
      // If the bot sent text, it tried to
      // report correctly.
      if (bot.say.args[0][0].text) {
        done();
      } else {
        done(new Error('Expected bot to report with text'));
      }
    });
  });

  // Teardown stubs
  this.After(() => {
    if (findAllChannelsStub) {
      findAllChannelsStub.restore();
    }
  });
};
