'use strict';
var botLib = require('../../lib/bot');
var common = require('./common');

const doIt = () => {
  botLib.giveHelp(common.botController);
  const fn = common.botController.hears;
  const handler = fn.args[0][fn.args[0].length - 1];
  handler(fn.__bot, {});
}

module.exports = function() {
  this.When('I say "@bot help"', doIt);
  this.When('I DM the bot with "help"', doIt);
};
