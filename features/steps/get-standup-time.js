'use strict';
var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');

module.exports = function() {
  var _channelFindStub = null;
  var _channelFindResolves = { get: function(dayName) {
    return false;
  }};

  // TODO: move these functions to common.js
  this.Given(/the standup is scheduled for ([1-2]?\d:[0-5]\d [ap]m)/, function(time) {
    var plus12 = time.substr(-2, 2) === 'pm' ? 1200 : 0;
    var scheduledTime = Number(time.replace(':', '').substr(0, 4).trim()) + plus12;

    _channelFindResolves.time = scheduledTime;
    if(!_channelFindStub) {
      _channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(_channelFindResolves);
    }
  });

  this.Given(/the standup is scheduled on (.*)/, function(days) {
    days = days.split(' ').map(day => day.toLowerCase());
    _channelFindResolves.get = function(dayName) {
      return days.indexOf(dayName.toLowerCase()) >= 0;
    }
    if(!_channelFindStub) {
      _channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(_channelFindResolves);
    }
  });

  // TODO: move these functions to common.js
  this.Given('no standup is scheduled', function() {
    _channelFindStub = sinon.stub(models.Channel, 'findOne').resolves(null);
  });

  this.When(/I say "@bot when"/, function(done) {
    botLib.getStandupInfo(common.botController);

    var message = {
      type: 'message',
      text: 'standup time',
      channel: 'CSomethingSaySomething'
    };

    common.botRepliesToHearing(message, done);
  });

  this.After(function() {
    if(_channelFindStub) {
      _channelFindStub.restore();
      _channelFindStub = null;
    }
  });
};
