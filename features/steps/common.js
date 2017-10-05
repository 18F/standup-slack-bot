const sinon = require('sinon');
const models = require('../../models');
const { flush } = require('../../lib/helpers/doInterview');

module.exports = function commonSteps() {
  this.Given('the bot is running', () => {
    module.exports.botController = { };
    module.exports.botController.hears = sinon.spy();
    module.exports.botController.on = sinon.spy();

    flush();

    const bot = {
      reply: sinon.spy(),
      startPrivateConversation: sinon.spy(),
      say: sinon.spy(),
      utterances: {
        yes: '',
        no: ''
      },
      api: {
        users: {
          info: sinon.stub().yields(null, { user: { real_name: 'Bob the Tester', profile: { image_72: 'thumbnail.png' } } })
        },
        team: {
          info: sinon.stub().yields(null, { team: { name: 'CSomethingSaySomething' } })
        },
        chat: {
          update: sinon.stub().yields(null, {})
        },
        channels: {
          info: sinon.stub().yields(null, { channel: { name: 'CSomethingSaySomething' } })
        },
        files: {
          upload: sinon.stub().yields(null, {})
        }
      }
    };

    module.exports.botController.hears.__bot = bot; // eslint-disable-line no-underscore-dangle
    module.exports.botController.on.__bot = bot; // eslint-disable-line no-underscore-dangle
  });

  this.Given('I am in a room with the bot', () => {

  });

  this.Then(/the bot should not respond/, () => {
    const bot = module.exports.botController.hears.__bot; // eslint-disable-line no-underscore-dangle
    return (!bot.reply.called && !bot.say.called && !bot.startPrivateConversation.called);
  });

  this.Then(/the bot should respond "([^"]+)"/, (responseContains) => {
    let botReply = module.exports.botController.hears.__bot.reply.args[0][1]; // eslint-disable-line no-underscore-dangle

    if (typeof botReply === 'object' && (botReply.text || botReply.attachments[0].fallback)) {
      botReply = botReply.text || botReply.attachments[0].fallback;
    }

    if (botReply.match(RegExp(responseContains))) {
      return true;
    }
    throw new Error(`Bot reply did not contain "${responseContains}"`);
  });

  this.Then(/the bot should start a private message with "([^"]+)"/, (responseContains) => {
    const bot = module.exports.botController.on.__bot; // eslint-disable-line no-underscore-dangle

    // First check if bot.say was called.  If it was, then the bot may have
    // sent a DM.  Check for that.
    if (bot.say.called) {
      const msg = bot.say.args[bot.say.args.length - 1][0];
      // If the target channel is a user, then it's a DM
      if (msg.channel[0] === 'U') {
        if (msg.text.indexOf(responseContains) >= 0) {
          return true;
        }
        throw new Error(`Bot reply did not contain "${responseContains}"`);
      }
    }

    // If the bot didn't send a DM, then we should check if it started a
    // private conversation and sent a message that way.

    const convo = {
      say: sinon.spy(),
      ask: sinon.spy(),
      on: sinon.spy()
    };

    let DmReply = bot.startPrivateConversation.args[0][1];
    DmReply('nothing', convo);

    const botResponse = convo.say.called ? convo.say : convo.ask;
    DmReply = botResponse.args[0][0];

    if (DmReply.indexOf(responseContains) >= 0) {
      return true;
    }
    throw new Error(`Bot reply did not contain "${responseContains}"`);
  });

  this.Then(/the bot should start a private message with an attachment saying "([^"]+)"/, (responseContains) => {
    const bot = module.exports.botController.on.__bot; // eslint-disable-line no-underscore-dangle

    if (bot.say.called) {
      const msg = bot.say.args[bot.say.args.length - 1][0];
      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const attachment of msg.attachments) {
          for (const field of attachment.fields) {
            if (field.value.indexOf(responseContains) >= 0) {
              return true;
            }
          }
        }
      }
    }
    throw new Error(`Bot reply did not contain an attachment saying "${responseContains}"`);
  });

  this.Then('the bot should upload a post', () => {
    const bot = module.exports.botController.on.__bot; // eslint-disable-line no-underscore-dangle

    if (bot.api.files.upload.called && bot.api.files.upload.args.length > 0) {
      const file = bot.api.files.upload.args[0][0];
      if (file && file.filetype === 'post') {
        return true;
      }
      throw new Error('Bot did not upload a post');
    }

    throw new Error('Bot did not upload anything');
  });

  let standupFindStub;
  this.Given(/I( do not)? have previous standups/, (dont) => {
    const todayDate = new Date();
    const yesterdayDate = new Date(new Date() - (24 * 60 * 60 * 1000));

    standupFindStub = sinon.stub(models.Standup, 'findAll');
    if (dont) {
      standupFindStub.resolves([]);
    } else {
      standupFindStub.resolves([
        {
          date: todayDate.toISOString(),
          yesterday: 'Did a thing',
          today: 'Doing a thing',
          blockers: 'Nothing',
          goals: 'Something'
        },
        {
          date: yesterdayDate.toISOString(),
          yesterday: 'Did a different thing',
          today: 'Doing another thing',
          blockers: 'Something',
          goals: 'Everything'
        }
      ]);
    }
  });

  this.After(() => {
    if (standupFindStub) {
      standupFindStub.restore();
      standupFindStub = null;
    }
  });
};

module.exports.botController = null;

module.exports.getHandler = fn => fn.args[0][fn.args[0].length - 1];

module.exports.botReceivesMessage = (message, inMethod) => {
  let method = inMethod;
  if (!method) {
    method = module.exports.botController.hears;
  }

  const fn = module.exports.getHandler(method);
  fn(method.__bot, message); // eslint-disable-line no-underscore-dangle
};

module.exports.botRepliesToHearing = (message, inMethod, inDone) => {
  let method = inMethod;
  let done = inDone;
  if (!done && typeof method === 'function') {
    done = method;
    method = module.exports.botController.hears;
  }

  const fn = module.exports.getHandler(method);
  fn(method.__bot, message); // eslint-disable-line no-underscore-dangle

  module.exports.wait(() => method.__bot.reply.called, () => { // eslint-disable-line no-underscore-dangle
    done();
  });
};

module.exports.botStartsConvoWith = (message, inMethod, inDone) => {
  let method = inMethod;
  let done = inDone;
  if (!done && typeof method === 'function') {
    done = method;
    method = module.exports.botController.on;
  }

  const fn = module.exports.getHandler(method);
  fn(method.__bot, message); // eslint-disable-line no-underscore-dangle

  module.exports.wait(() => method.__bot.startPrivateConversation.called, () => { // eslint-disable-line no-underscore-dangle
    done();
  });
};

module.exports.wait = (until, done) => {
  if (until()) {
    done();
  } else {
    setTimeout(() => {
      module.exports.wait(until, done);
    }, 10);
  }
};
