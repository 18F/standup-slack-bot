'use strict';

var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');
// var helpers = require('../../lib/helpers');

module.exports = function () {
  var _standupFindStub = null;
  var _message = { };

  this.Given('I have previous standups', function() {
    var todayDate = new Date();
    var yesterdayDate = new Date(new Date() - 24 * 60 * 60 * 1000);

    _standupFindStub = sinon.stub(models.Standup, 'findAll').resolves([
      {
        date: todayDate.toISOString(),
        yesterday: 'Did a thing',
        today: 'Doing a thing',
        blockers: 'Nothing',
        goals: 'Something'
      },
      {
        date: yesterdayDate.toISOString(),
        yesterday: 'Did a different thing',
        today: 'Doing another thing',
        blockers: 'Something',
        goals: 'Everything'
      }
    ]);
  });

  this.When(/I say "@bot ((report) (.*))"/, function(message, triggerWord, rest, done) {
    botLib.userReport(common.botController);

    _message.type = 'message';
    _message.text = message;
    _message.channel = _message.channel || 'CSomethingSaySomething';
    _message.user = _message.user || 'Somebody';
    _message.match = [
      message,
      triggerWord,
      rest
    ];

    common.botRepliesToHearing(_message, done);
  });

  this.After(function() {
    if(_standupFindStub) {
      _standupFindStub.restore();
      _standupFindStub = null;
    }
  });
};
