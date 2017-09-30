

const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');
const models = require('../../models');
// var helpers = require('../../lib/helpers');

module.exports = function () {
  const _standupFindStub = null;
  const _message = { };

  this.When(/I say "@bot ((report) (.*))"/, (message, triggerWord, rest, done) => {
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
