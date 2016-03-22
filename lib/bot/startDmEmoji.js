'use strict';

var log = require('../../getLogger')('create standup');
var models = require('../../models');
var moment = require('moment');
var helpers = require('../helpers');

function startDmEmoji(bot, message) {
  log.verbose('Got an emoji reaction: '+message.reaction+' from '+message.user);
  models.Channel.findOne({
    where: {
      name: message.item.channel
    }
  }).then(function(channel) {
    if (channel) {
      var yesterday;
      var today;
      var blockers;
      var goal;
      var userRealName;
      bot.api.users.info({'user':message.user}, function(err, response) {
        userRealName = response.user.real_name;
      });
      var now = helpers.time.getDisplayFormat();
      var channelTime = helpers.time.getDisplayFormat(channel.time);
      if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
        bot.startPrivateConversation({user: message.user}, function(response, convo){
          // TODO: consider allowing multi-line responses
          convo.say('Hey there! Let\'s record your standup for <#'+message.item.channel+'>:');
          convo.ask('What did you do yesterday?', function(response, conversation) {
            yesterday = response.text;
            conversation.next();
          });
          convo.ask('What are you doing today?', function(response, conversation) {
            today = response.text;
            conversation.next();
          });
          convo.ask('Do you have any blockers?', function(response, conversation) {
            blockers = response.text;
            conversation.next();
          });
          convo.ask('Any major goal for the day?', function(response, conversation) {
            goal = response.text;
            convo.say('Thanks! I\'ll record that for the standup at '+
                        helpers.time.getDisplayFormat(channel.time));
            conversation.next();
          });
          convo.on('end',function(convo) {

            if (convo.status === 'completed') {
              // botkit provides a cool function to get all responses, but it was easier
              // to just set them during the convo
              // var res = convo.extractResponses();

              models.Standup.upsert(
                {
                  yesterday: yesterday,
                  today: today,
                  blockers: blockers,
                  goal: goal,
                  user: message.user,
                  date: helpers.time.getReportFormat(),
                  channel: message.item.channel,
                  userRealName: userRealName
                },
                {
                  where: {
                    channel: message.item.channel,
                    date: helpers.time.getReportFormat(),
                    user: message.user
                  }
                });
            } else {
              // something happened that caused the conversation to stop prematurely
            }
          });
        });
      } else {
        bot.startPrivateConversation({user: message.user}, function(response, convo){
          convo.say('Sorry, it looks like the report has already run.');
        });
      }
    }
  });
}

function attachListener(controller, botId) {
  // console.log('1');
  controller.on('reaction_added', function(bot, message) {
    // console.log('2');
    // console.log(message);
    // console.log(botId);
    if (message.item_user === botId) {
      // console.log('3');
      startDmEmoji(bot, message);
    }
  });
}

module.exports = attachListener;
