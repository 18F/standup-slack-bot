'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');
var time = require('./time');
var reportRunner = require('../../lib/bot/getReportRunner');

module.exports = function() {
  var _message = { };
  var _findAllChannelsStub;
  var _bot;

  this.When(/I say "@bot ((reminder) (.*))"/,
    function(message, triggerWord, rest, done) {
      botLib.setReminder(common.botController);

      _message.type = 'message';
      _message.text = message;
      _message.channel = _message.channel || 'CSomethingSaySomething';
      _message.match = [
        message,
        triggerWord,
        rest
      ];

      common.botRepliesToHearing(_message, done);
  });

  this.When('the reminder time comes', function() {
    _findAllChannelsStub = sinon.stub(models.Channel, 'findAll');
    _findAllChannelsStub.resolves([{
      name: 'Test Channel'
    }]);

    // Also stub the bot
    _bot = { };
    _bot.say = sinon.spy();

    // Kick off the reporter
    reportRunner(_bot)();

    // If fake timers have been setup, reset them now.
    // Otherwise, setTimeout won't behave correctly (i.e.,
    // at all).
    time.resetTimers();
  });

  this.Then('the bot should send a reminder', function(done) {
    // Wait until the findAll and say stubs have been called
    common.wait(function() {
      return _findAllChannelsStub.called && _bot.say.called;
    }, function() {
      // If the bot sent text and attachments, it tried to
      // report correctly.
      if(_bot.say.args[0][0].text && _bot.say.args[0][0].attachments.length) {
        done();
      } else {
        done(new Error('Expected bot to report with text and attachments'));
      }
    });
  });

  // Teardown stubs
  this.After(function() {
    if(_findAllChannelsStub) {
      _findAllChannelsStub.restore();
    }
  });
};
