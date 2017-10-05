'use strict';
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };

  this.When(/I say "@bot ((.*)?(en|dis)able updates)"/,
    function(message, maybeStuffBefore, enOrDis, done) {
      botLib.setInChannelUpdate(common.botController);

      _message.type = 'message';
      _message.text = message;
      _message.match = message.match(/(en|dis)able updates/i);
      _message.channel = _message.channel || 'CSomethingSaySomething';

      common.botRepliesToHearing(_message, done);
  });

};
