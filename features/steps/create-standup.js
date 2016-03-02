'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');

module.exports = function() {
  var _message = { };
  var _createStandupFn = null;
  var _botReply = '';

  this.Given('the bot is running', function() {
    var fakeController = { };
    fakeController.hears = sinon.spy();
    botLib.createStandup(fakeController);
    _createStandupFn = fakeController.hears.args[0][2]
  });

  this.Given('I am in a room with the bot', function() {
    _message.channel = 'CSomethingSaySomething';
  });

  this.When(/I say "@bot ((create|schedule) (standup .*))"/, function(message, triggerWord, rest, done) {
    _message.type = 'message';
    _message.text = message;
    _message.match = [
      message,
      triggerWord,
      rest
    ];

    var bot = { };
    bot.reply = sinon.spy();
    _createStandupFn(bot, _message);

    var wait = function() {
      if(bot.reply.called) {
        _botReply = bot.reply.args[0][1];
        done();
      } else {
        setTimeout(wait, 200);
      }
    }
    wait();
  });

  this.Then('the bot should respond "Got it"', function() {
    if(/^Got it/.test(_botReply)) {
      return true;
    } else {
      throw new Exception('Bot reply did not start with "Got it"');
    }
  });
};
