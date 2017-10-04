'use strict';
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  var _message = { };

  this.When(/I say "@bot ((enable|disable) updates)"/,
    function(message, which, done) {
      botLib.setInChannelUpdate(common.botController);

      _message.type = 'message';
      _message.text = message;
      _message.match = [ message ];
      _message.channel = _message.channel || 'CSomethingSaySomething';

      common.botRepliesToHearing(_message, done);
  });

};
