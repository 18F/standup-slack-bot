const botLib = require('../../lib/bot');
const common = require('./common');

const doIt = () => {
  botLib.giveHelp(common.botController);
  const fn = common.botController.hears;
  const handler = fn.args[0][fn.args[0].length - 1];
  handler(fn.__bot, {}); // eslint-disable-line no-underscore-dangle
};

module.exports = function giveHelpTests() {
  this.When('I say "@bot help"', doIt);
  this.When('I DM the bot with "help"', doIt);
};
