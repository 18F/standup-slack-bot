'use strict';
var sinon = require('sinon');
var helpers = require('../../lib/helpers')
var botLib = require('../../lib/bot');
var models = require('../../models');
var common = require('./common');

module.exports = function() {
  var _message = { };
  var _getUserStandupFn = null;
  var _findOneChannelStub;
  var _findOrCreateStub;
  var _findOneStandupStub;
  var _getUserStub;

  this.Given(/I want to send a standup for a ([^>]+) channel/, function(visibility) {
    if(visibility === 'public') {
      _message.channel = 'CSomethingSaySomething';
    } else {
      _message.channel = 'PnutButterJellyTime';
    }
  });

  this.Given(/^the channel (.+) have a standup/, function(status) {
    if(status === 'does') {
      _findOneChannelStub = sinon.stub(models.Channel, 'findOne').resolves({
        time: '130', name: 'CSomethingSaySomething'
      });
      _findOrCreateStub = sinon.stub(models.Standup, 'findOrCreate').resolves({ });
      _findOneStandupStub = sinon.stub(models.Standup, 'findOne').resolves({
        user: 'U00000000',
        userRealName: 'Bob the Tester',
        yesterday: 'In the past',
        today: 'Now',
        blockers: 'Barricades',
        goal: 'Accomplishments-to-be'
      });
    }
  });

  this.When(/^I DM the bot with standup$/, function(message, done) {
      botLib.getUserStandupInfo(common.botController);
      _getUserStub = sinon.stub(helpers, 'getUser').resolves({ real_name: 'Bob the Tester' });

      _message.user = 'me';
      _message.match = [
        '<#' + _message.channel + '> ' + message, // whole message
        '', // optionally the word 'standup'
        _message.channel,
        '', // iOS channel tag has '|channelName' on the end
        message
      ];

      common.botRepliesToHearing(_message, done);
  });

  this.When('I edit a DM to the bot to say', function(message, done) {
    botLib.getUserStandupInfo(common.botController);
    _getUserStub = sinon.stub(helpers, 'getUser').resolves({ real_name: 'Bob the Tester' });

    common.botRepliesToHearing({
      type: 'message',
      message: {
        type: 'message',
        user: 'U00000000',
        text: '<#' + _message.channel + '> ' + message,
        edited: { user: 'U00000000', ts: '1234567890.000000' },
        ts: '1234567890.000000'
      },
      subtype: 'message_changed',
      hidden: true,
      channel: 'Dchannel',
      'previous_message': {
        type: 'message',
        user: 'U00000000',
        text: 'Not really relevant...',
        ts: '1234567890.000000'
      },
      'event_ts': '1234567890.000000',
      ts: '1234567890.000000'
    }, common.botController.on, done);
  });

  this.After(function() {
    if(_findOneChannelStub) {
      _findOneChannelStub.restore();
      _findOneChannelStub = null;
    }
    if(_findOrCreateStub) {
      _findOrCreateStub.restore();
      _findOrCreateStub = null;
    }
    if(_findOneStandupStub) {
      _findOneStandupStub.restore();
      _findOneStandupStub = null;
    }
    if(_getUserStub) {
      _getUserStub.restore();
      _getUserStub = null;
    }
  });
};
