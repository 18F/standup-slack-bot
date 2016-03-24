'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');

module.exports = function() {
  var _message = { };
  var _channelFindOrCreateStub = null;

  this.Given('I am in a private room with the bot', function() {
    botLib.createStandup(common.botController);
    _message.channel = 'PnutButterJellyTime';
  });

  this.When(/I say "@bot ((create|schedule) (standup .*))"/,
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

      _channelFindOrCreateStub = sinon.stub(models.Channel, 'findOrCreate').resolves([{ name: message.channel }]);
      common.botRepliesToHearing(_message, done);
  });

  this.After(function() {
    if(_channelFindOrCreateStub) {
      _channelFindOrCreateStub.restore();
      _channelFindOrCreateStub = null;
    }
  });
};
