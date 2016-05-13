'use strict';
var sinon = require('sinon');

module.exports = function() {
  this.Given('the bot is running', function() {
    module.exports.botController = { };
    module.exports.botController.hears = sinon.spy();
    module.exports.botController.on = sinon.spy();

    var bot = {
      reply: sinon.spy(),
      startPrivateConversation: sinon.spy(),
      say: sinon.spy(),
      api: {
        users: {
          info: sinon.stub().yields(null, { user: { real_name: 'Bob the Tester', profile: { image_72: 'thumbnail.png' }}})
        },
        team: {
          info: sinon.stub().yields(null, { team: { name: 'CSomethingSaySomething' }})
        },
        chat: {
          update: sinon.stub().yields(null, {})
        },
        channels: {
          info: sinon.stub().yields(null, { channel: { name: 'CSomethingSaySomething'}})
        }
      }
    };

    module.exports.botController.hears.__bot = bot;
    module.exports.botController.on.__bot = bot;
  });

  this.Given('I am in a room with the bot', function() {

  });

  this.Then(/the bot should respond "([^"]+)"/, function(responseContains) {
    var botReply = module.exports.botController.hears.__bot.reply.args[0][1];

    if(typeof botReply === 'object' && botReply.text) {
      botReply = botReply.text;
    }

    if(botReply.indexOf(responseContains) >= 0) {
      return true;
    } else {
      console.log(botReply);
      throw new Error('Bot reply did not contain "' + responseContains + '"');
    }
  });

  this.Then(/the bot should start a private message with "([^"]+)"/, function(responseContains) {
    var convo = {
      say: sinon.spy(),
      ask: sinon.spy(),
      on: sinon.spy()
    };

    var DmReply = module.exports.botController.on.__bot.startPrivateConversation.args[0][1];
    DmReply('nothing', convo);
    DmReply = convo.say.args[0][0];
    console.log(DmReply);
    if(DmReply.indexOf(responseContains) >= 0) {
      return true;
    } else {
      throw new Error('Bot reply did not contain "' + responseContains + '"');
    }
  });
};

module.exports.botController = null;

module.exports.getHandler = function(fn) {
  return fn.args[0][fn.args[0].length - 1];
};

module.exports.botRepliesToHearing = function(message, method, done) {
  if(!done && typeof method === 'function') {
    done = method;
    method = module.exports.botController.hears;
  }

  var fn = module.exports.getHandler(method);
  fn(method.__bot, message);

  module.exports.wait(function() { return method.__bot.reply.called; }, function() {
    done();
  });
};

module.exports.botStartsConvoWith = function(message, method, done) {
  if(!done && typeof method === 'function') {
    done = method;
    method = module.exports.botController.on;
  }

  var fn = module.exports.getHandler(method);
  fn(method.__bot, message);

  module.exports.wait(function() { return method.__bot.startPrivateConversation.called; }, function() {
    done();
  });
};

module.exports.wait = function(until, done) {
  if(until()) {
    done();
  } else {
    setTimeout(function() {
      module.exports.wait(until, done);
    }, 10);
  }
};
