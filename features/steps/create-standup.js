'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };
  var _createStandupFn = null;
  var _botReply = '';

  this.Given('I am in a room with the bot', function() {
    botLib.createStandup(common.botController);
    _createStandupFn = common.getHandler(common.botController.hears);
    _message.channel = 'CSomethingSaySomething';
  });

  this.When(/I say "@bot ((create|schedule) (standup .*))"/,
    function(message, triggerWord, rest, done) {
      _message.type = 'message';
      _message.text = message;
      _message.match = [
        message,
        triggerWord,
        rest
      ];

      var bot = {
        reply: sinon.spy()
      };
      _createStandupFn(bot, _message);

      common.wait(function() { return bot.reply.called; }, function() {
        _botReply = bot.reply.args[0][1];
        done();
      });
  });

  this.Then('the bot should respond "Got it"', function() {
    if(/^Got it/.test(_botReply)) {
      return true;
    } else {
      throw new Error('Bot reply did not start with "Got it"');
    }
  });
};
