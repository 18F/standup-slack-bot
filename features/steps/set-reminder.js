'use strict';
// var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
// var models = require('../../models');

module.exports = function() {
  var _message = { };
  // var _findAllChannelsStub;
  // var _bot;

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

};
