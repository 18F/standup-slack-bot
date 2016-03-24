'use strict';
var sinon = require('sinon');
var models = require('../../models');
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };
  var _channelDestroyStub = null;

  this.When(/I say "@bot ((remove|delete) (standup))"/,
    function(message, triggerWord, rest, done) {
      botLib.removeStandup(common.botController);

      _message.type = 'message';
      _message.text = message;
      _message.channel = _message.channel || 'CSomethingSaySomething';
      _message.match = [
        message,
        triggerWord,
        rest
      ];

      _channelDestroyStub = sinon.stub(models.Channel, 'destroy').resolves({ });
      common.botRepliesToHearing(_message, done);
  });

  this.After(function() {
    if(_channelDestroyStub) {
      _channelDestroyStub.restore();
      _channelDestroyStub = null;
    }
  });
};
