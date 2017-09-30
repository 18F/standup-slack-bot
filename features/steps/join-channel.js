const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function joinChannelTests() {
  let createJoinFn = null;
  let botReply = '';
  let botName = '';

  this.Given(/^the bot is named "([^"]+)"$/, (botNameFromSetup) => {
    botName = botNameFromSetup;
    botLib.joinChannel(common.botController, botName);
    createJoinFn = common.getHandler(common.botController.on);
  });

  this.When('the bot joins a channel', (done) => {
    const bot = { };
    bot.reply = sinon.spy();

    createJoinFn(bot, { });

    common.wait(() => bot.reply.called, () => {
      botReply = bot.reply.args[0][1].text;
      done();
    });
  });

  this.Then(/^the bot says$/, (message) => {
    const expected = message.replace(/@<(bot-name)>/, `@${botName}`);

    if (expected === botReply) {
      return true;
    }
    throw new Error(`Bot introduction was not "${expected}"`);
  });
};
