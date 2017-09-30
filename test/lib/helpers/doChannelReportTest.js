const assert = require('assert');
const sinon = require('sinon');
const mockBot = require('../../support/mockBot');
const dbHelper = require('../../support/persistenceHelper');

const doChannelReport = require('../../../lib/helpers/doChannelReport');

describe('doChannelReport', () => {
  let bot;
  let channelName;
  let userName;
  let state;

  beforeEach(() => {
    bot = mockBot();
    channelName = 'channelName';
    userName = 'slackUserName';
  });

  describe('when all the records are present, and the bot works', () => {
    beforeEach((done) => {
      state = {};
      dbHelper
        .setupTest(channelName, state)
        .then(() => { done(); });
    });

    describe('when updating', () => {
      it('updates the report', (done) => {
        const spy = sinon.spy();
        bot.api.chat.update = spy;
        doChannelReport(bot, channelName, true, userName, () => {
          assert(bot.api.chat.update.calledOnce);
          const report = spy.args[0][0];
          const callback = spy.args[0][1];
          assert(report.attachments.match(/Todays standup for <#channelName>/));
          callback(); // just to make sure no errors, can't make assertions
          // because it does not use the callback argument
          done();
        });
      });

      it('says a new report after updating', (done) => {
        const spy = sinon.spy();
        bot.say = spy;
        doChannelReport(bot, channelName, true, userName, () => {
          assert(bot.say.calledOnce);
          const report = spy.args[0][0];
          assert(report.text.match(/I've updated the report with a standup from slackUserName/));
          done();
        });
      });
    });

    describe('when reporting for the first time', () => {
      it('says a new report', (done) => {
        const spy = sinon.spy();
        bot.say = spy;
        doChannelReport(bot, channelName, false, userName, () => {
          assert(bot.say.calledOnce);
          const report = spy.args[0][0];
          assert.equal(report.attachments[0].pretext, 'Todays standup for <#channelName>');
          done();
        });
      });
    });
  });
});
