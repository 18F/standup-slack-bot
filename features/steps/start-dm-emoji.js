const sinon = require('sinon');
const botLib = require('../../lib/bot');
const common = require('./common');
const models = require('../../models');
const helpers = require('../../lib/helpers');

module.exports = function startDMEmojiTests() {
  const botMessage = { };
  let now;
  botMessage.item = { };
  let getTimeStub;
  let findAllStandupsStub;
  let botID = '';

  this.Given(/it (.*) before the standup report has run for the day/, (onTime) => {
    if (onTime === 'is') {
      now = '5:30 am EST';
    } else {
      now = '5:30 pm EST';
    }
    getTimeStub = sinon.stub(helpers.time, 'getDisplayFormat')
      .onFirstCall().returns(now)
      .onSecondCall()
      .returns('12:30 pm EST');
  });

  this.Given(/^the bot ID is 'U(\d+)'$/, (botId) => {
    botID = botId;
  });

  this.When('I add an emoji reaction to the bot\'s reminder message', (done) => {
    botLib.startDmEmoji(common.botController, `U${botID}`);

    botMessage.type = 'reaction_added';
    botMessage.item.channel = botMessage.channel || 'CSomethingSaySomething';
    botMessage.item_user = `U${botID}`;
    botMessage.user = 'U7654321';
    botMessage.reaction = 'thumbsup';

    findAllStandupsStub = sinon.stub(models.Standup, 'findAll').resolves([]);
    common.botReceivesMessage(botMessage, common.botController.on);
    setTimeout(() => done(), 1000);
  });

  this.After(() => {
    if (findAllStandupsStub) {
      findAllStandupsStub.restore();
      findAllStandupsStub = null;
    }
    if (getTimeStub) {
      getTimeStub.stub.restore();
      getTimeStub = null;
    }
  });
};
