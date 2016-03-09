'use strict';
var botLib = require('../../lib/bot');
var common = require('./common');

module.exports = function() {
  this.When('I say "@bot help"', function(done) {
    botLib.giveHelp(common.botController);
    common.botRepliesToHearing({ }, done);
  });

  this.When('I DM the bot with "help"', function(done) {
    botLib.giveHelp(common.botController);
    common.botRepliesToHearing({ }, done);
  });
};
