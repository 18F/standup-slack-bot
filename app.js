'use strict';

var Botkit = require('botkit');
var dateFormat = require('dateformat');
require('dotenv').config();

if (!process.env.SLACK_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

// Database
var models = require('./models');
models.sequelize.sync(
  {force: true}
);

var controller = Botkit.slackbot({
 debug: false
});

controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// TODO: post standup report to channel at set time
// TODO: method to set standup frequency
// TODO: add usage messages
// TODO: remind people to do standup?

// Add or change a standup message in a DM with the bot
// TODO: store standups in db
// TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
// TODO: update reports when edited
// TODO: parse standup messages
controller.hears(['standup (\\S*)((.|\n)*)'],['direct_message'], function (bot, message) {
  var standupChannel = message.match[1];
  var content = message.match[2];
  models.Channel.findOne({
    where: {name: standupChannel}
  }).then(function (channel) {
    if (!channel) {
      models.Standup.findOrCreate({
        where: {
          channel: standupChannel,
          date: dateFormat(new Date(), 'isoDate'),
          user: message.user
        }
      }).then(function (standup) {
        // console.log(standup);
        var notes = content.split(/\n/);
        var yesterday = standup.yesterday;
        var today = standup.today;
        var blockers = standup.blockers;
        var goal = standup.goal;
        for (var note in notes) {
          var item = notes[note].replace(/\n/g,'');
          switch (item[0]) {
            case 'y':
              yesterday = item;
              break;
            case 't':
              today = item;
              break;
            case 'b':
              blockers = item;
              break;
            case 'g':
              goal = item;
              break;
            default:
              console.log('no match for '+item);
          }
        }
        models.Standup.update(
          {
            yesterday: yesterday,
            today: today,
            blockers: blockers,
            goal: goal
          },
          {where: {
            channel: standupChannel,
            date: dateFormat(new Date(), 'isoDate'),
            user: message.user
          }
        });
      });
      return bot.reply(message, 'that channel exists');
    } else {
      return bot.reply(message, 'The '+standupChannel+' channel doesn\'t have any standups set');
    }
  });
});

// I think that these aren't necessary because channel & user are stored as
// unique id rather than display name
// TODO: update channel name if it changes
// TODO: update user name if it changes
