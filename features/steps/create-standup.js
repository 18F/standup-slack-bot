'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };
  var _createStandupFn = null;
  var _botReply = '';

  this.Given('I am in a private room with the bot', function() {
    botLib.createStandup(common.botController);
    _message.channel = 'PnutButterJellyTime';
  });

  this.When(/I say "@bot ((create|schedule) (standup .*))"/,
    function(message, triggerWord, rest, done) {
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
};
