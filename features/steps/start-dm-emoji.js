'use strict';

var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');
var helpers = require('../../lib/helpers');

module.exports = function() {
  var _message = { };
  var now;
  _message.item = { };
  var _getTimeStub;
  var _findAllStandupsStub;
  var _botId = '';

  this.Given(/it (.*) before the standup report has run for the day/, function(onTime) {
    if (onTime === 'is') {
      now = '5:30 am EST';
    } else {
      now = '5:30 pm EST';
    }
    _getTimeStub = sinon.stub(helpers.time, 'getDisplayFormat')
      .onFirstCall().returns(now)
      .onSecondCall().returns('12:30 pm EST');
  });

  this.Given(/^the bot ID is 'U(\d+)'$/, function(botId) {
    _botId = botId;
  });

  this.When('I add an emoji reaction to the bot\'s reminder message', function(done) {
    botLib.startDmEmoji(common.botController, 'U'+_botId);

    _message.type = 'reaction_added';
    _message.item.channel = _message.channel || 'CSomethingSaySomething';
    _message.item_user = 'U'+_botId;
    _message.user = 'U7654321';
    _message.reaction = 'thumbsup';

    _findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([ ]);
    common.botReceivesMessage(_message, common.botController.on);
    setTimeout(() => done(), 1000);
  });

  this.After(function() {
    if(_findAllStandupsStub) {
      _findAllStandupsStub.restore();
      _findAllStandupsStub = null;
    }
    if(_getTimeStub) {
      _getTimeStub.stub.restore();
      _getTimeStub = null;
    }
  });
};
