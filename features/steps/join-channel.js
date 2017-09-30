
const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');

module.exports = function () {
  let _createJoinFn = null;
  let _botReply = '';
  let _botName = '';

  this.Given(/^the bot is named "([^"]+)"$/, (botName) => {
    _botName = botName;
    botLib.joinChannel(common.botController, botName);
    _createJoinFn = common.getHandler(common.botController.on);
  });

  this.When('the bot joins a channel', (done) => {
    const bot = { };
    bot.reply = sinon.spy();

    _createJoinFn(bot, { });

    common.wait(() => bot.reply.called, () => {
      _botReply = bot.reply.args[0][1].text;
      done();
    });
  });

  this.Then(/^the bot says$/, (message) => {
    const expected = message.replace(/@<(bot-name)>/, `@${_botName}`);

    if (expected === _botReply) {
      return true;
    }
    throw new Error(`Bot introduction was not "${expected}"`);
  });
};
