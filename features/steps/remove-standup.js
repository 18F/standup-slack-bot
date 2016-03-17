'use strict';
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };

  this.When(/I say "@bot ((remove|delete) (standup .*))"/,
    function(message, triggerWord, rest, done) {
      botLib.createStandup(common.botController);

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
