'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var models = require('../../models');
var common = require('./common');

module.exports = function() {
  var _message = { };
  var _getUserStandupFn = null;
  var _botReply = '';
  var _findOneStub;
  var _findOrCreateStub;

  this.Given(/I want to send a standup for a ([^>]+) channel/, function(visibility) {
    if(visibility === 'public') {
      _message.channel = 'CSomethingSaySomething';
    } else {
      _message.channel = 'PnutButterJellyTime'
    }
  });

  this.Given(/^the channel (.+) have a standup/, function(status) {
    if(status === 'does') {
      _findOneStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '130' });
      _findOrCreateStub = sinon.stub(models.Standup, 'findOrCreate').resolves({ });
    }
  });

  this.When(/^I DM the bot with standup$/, function(message, done) {
      botLib.getUserStandupInfo(common.botController);
      _getUserStandupFn = common.getHandler(common.botController.hears);

      _message.user = 'me';
      _message.match = [
        '<#' + _message.channel + '> ' + message, // whole message
        '', // optionally the word 'standup'
        _message.channel,
        message
      ];

      var bot = {
        reply: sinon.spy()
      };
      _getUserStandupFn(bot, _message);

      common.wait(function() { return bot.reply.called; }, function() {
        _botReply = bot.reply.args[0][1];
        done();
      });
  });

  this.Then(/the bot should respond with "([^"]+)"/, function(responseStart) {
    if(_botReply.indexOf(responseStart) >= 0) {
      return true;
    } else {
      throw new Error('Bot reply did not contain "' + responseStart + '"');
    }
  });

  this.After(function() {
    if(_findOneStub) {
      _findOneStub.restore();
      _findOneStub = null;
    }
    if(_findOrCreateStub) {
      _findOrCreateStub.restore();
      _findOrCreateStub = null;
    }
  });
};
