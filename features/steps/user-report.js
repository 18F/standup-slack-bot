'use strict';

var sinon = require('sinon');
var botLib = require('../../lib/bot');
var common = require('./common');
var models = require('../../models');
// var helpers = require('../../lib/helpers');

module.exports = function () {
  var _standupFindStub = null;
  var _message = { };

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
};
