'use strict';

var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');
// var helpers = require('../../lib/helpers');

module.exports = function() {
  var _message = { };
  // var _getUserStub;
  var _findOneChannelStub;
  var _botId = '';

  this.Given(/it (.*) before the standup report has run for the day/, function(onTime) {
    if (onTime === 'is not') {
      // Do something
    } else {
      // Do something else
    }
  });

  this.Given(/^the bot ID is 'U(\d+)'$/, function(botId) {
    _botId = botId;
  });

  this.When('I add an emoji reaction to the bot\'s reminder message', function(done) {
    botLib.startDmEmoji(common.botController);

    _message.type = 'reaction_added';
    _message.channel = _message.channel || 'CSomethingSaySomething';
    _message.item_user = 'U'+_botId;
    _message.user = 'U7654321';
    _message.reaction = 'thumbsup';

    _findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({ time: '1230' });
    common.botRepliesToHearing(_message, done);
  });

  this.After(function() {
    if(_findOneChannelStub) {
      _findOneChannelStub.restore();
      _findOneChannelStub = null;
    }
  });
};
