'use strict';
var sinon = require('sinon');

var common = require('./common');
var time = require('./time');
var models = require('../../models');
var reportRunner = require('../../lib/bot/getReportRunner');

module.exports = function() {
  var _findAllChannelsStub;
  var _findOneChannelStub;
  var _findAllStandupsStub;
  var _bot;

  this.When('the scheduled time comes', function() {
    // Stub the models.Channel and models.Standup findAll
    // methods so we can guarantee behavior without worrying
    // about database contents.
    _findAllChannelsStub = sinon.stub(models.Channel, 'findAll');
    _findAllChannelsStub.resolves([{
      name: 'Test Channel',
      audience: null
    }]);

    _findOneChannelStub = sinon.stub(models.Channel, 'findOne');
    _findOneChannelStub.resolves({
      name: 'Test Channel',
      audience: null
    });

    _findAllStandupsStub = sinon.stub(models.Standup, 'findAll');
    _findAllStandupsStub.resolves([{
      user: 'U00000000',
      userRealName: 'Bob the Tester',
      yesterday: 'In the past',
      today: 'Now',
      blockers: 'Barricades',
      goal: 'Accomplishments-to-be'
    }]);

    // Also stub the bot
    _bot = { };
    _bot.say = sinon.stub().yields();
    _bot.replyInThread = sinon.spy();

    // Kick off the reporter
    reportRunner(_bot)();

    // If fake timers have been setup, reset them now.
    // Otherwise, setTimeout won't behave correctly (i.e.,
    // at all).
    time.resetTimers();
  });

  this.Then('the bot should report', function(done) {
    // Wait until the findAll and say stubs have been called
    common.wait(function() {
      return _findAllChannelsStub.called && _findAllChannelsStub.called && _bot.say.called && _bot.replyInThread.called;
    }, function() {
      const sayMessage = _bot.say.args[0][0];
      const threadedMessage = _bot.replyInThread.args[0][1];

      // The bot should post that it's doing the report, and
      // then reply to itself in a thread with the attachments
      // of the actual report
      if (sayMessage.text.startsWith(`Today's standup for`) && threadedMessage.attachments.length) {
        done();
      } else {
        done(new Error('Expected bot to report with text and attachments in a thread'));
      }
    });
  });

  this.Then('the bot should not report', function(done) {
    // Wait a second to give the report runner time
    // to bail out.  Since it shouldn't be calling
    // anything, we can't just wait until things
    // have been called.
    setTimeout(function() {
      if(_bot.say.called) {
        done(new Error('Expected bot not to report'));
      } else {
        done();
      }
    }, 1000);
  });

  // Teardown stubs
  this.After(function() {
    if(_findAllChannelsStub) {
      _findAllChannelsStub.restore();
    }
    if(_findOneChannelStub) {
      _findOneChannelStub.restore();
    }
    if(_findAllStandupsStub) {
      _findAllStandupsStub.restore();
    }
  });
};
