'use strict';

var Botkit = require('botkit');
var moment = require('moment');
var schedule = require('node-schedule');
var un = require('underscore');
var async = require('async');
require('dotenv').config();

// Database setup
var models = require('./models');
models.sequelize.sync(
  // Set to true to reset db on load
  {force: false}
);

// Check for a Slack token
if (!process.env.SLACK_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  debug: false
});

// Set these two variables so that we can access bot functions outside of a controller
// function, for example when calling bot.say() without a message trigger
var me = '';
var anytimeBot = {};

// Initialize the bot
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM(function(err, bot) {
  if (err) {
    throw new Error(err);
  } else {
    anytimeBot = bot;
    bot.identifyBot(function(err,identity) {
      me = identity.name;
      // identity contains...
      // {name, id, team_id}
    });
  }
});

// Set up cron job to check every minute for channels that need a standup report
var j = schedule.scheduleJob('* * * * *', function() {
  var time = moment().format('HHmm');
  var date = moment().format('YYYY-MM-DD');

  // Find channels that want a report at this minute
  models.Channel.findAll({
    where: {
      frequency: 'daily',
      time: time
    }
  }).then(function (channels) {
    // Iterate over the channels
    un.each(channels, function(channel) {
      // Find standup messages for that channel & for today
      models.Standup.findAll({
        where: {
          channel: channel.name,
          date: date
        }
      }).then(function (standups) {
        // Begin a Slack message for this channel
        // https://api.slack.com/docs/attachments
        var report = {
          text: 'Todays standup for <#'+channel.name+'>:',
          attachments: [],
          channel: channel.name
        };
        var attachments = [];
        async.series([
          // Iterate over this channels standup messages
          function(callback) {
            un.each(standups, function (standup) {
              var fields = [];
              if (standup.yesterday) {
                fields.push({
                    title: 'Yesterday',
                    value: standup.yesterday,
                    short: false
                });
              }
              if (standup.today) {
                fields.push({
                  title: 'Today',
                  value: standup.today,
                  short: false
                });
              }
              if (standup.blockers) {
                fields.push({
                  title: 'Blockers',
                  value: standup.blockers,
                  short: false
                });
              }
              if (standup.goal) {
                fields.push({
                  title: 'Goal',
                  value: standup.goal,
                  short: false
                });
              }
              attachments.push({
                title: '<@'+standup.user+'>',
                fields: fields
              });
            });
            callback(null);
          },
          // Send that report off to Slack
          function(callback) {
            report.attachments = attachments;
            anytimeBot.say(report);
            callback(null);
          }
        ]);
      });
    });
  });
});

// TODO: method to set standup frequency
// TODO: add usage messages
// TODO: remind people to do standup?

// Message for when the bot is added to a channel
controller.on('bot_channel_join', function (bot, message) {
  return bot.reply(message, {
    text: 'Hi! To set up a standup, say `@'+me+' create standup [daily/weekly] [time]`'
  });
});

// Create a standup in a channel
controller.hears(['(schedule|create) standup (.*)'],['direct_mention'], function (bot, message) {
  var frequency = '';
  var weekday = '';
  var time = message.match[2].match(/(\d+|:)*(\s)?((a|p)m)/gi);
  time = moment(time[0], ['h:mm a','hmm a','hmma','HHmm','hha','hh a']);
  if (message.match[2].match(/daily/)) {
    frequency = 'daily';
  } else if (message.match[2].match(/weekly/)) {
    frequency = 'weekly';
    weekday = message.match[2].match(/(\w)*day/i);
  }
  models.Channel.findOrCreate({
    where: {
      name: message.channel
    }
  }).then(function () {
    models.Channel.update(
      {
        frequency: frequency,
        day: weekday,
        time: moment(time).format('HHmm')
      },
      {
        where: {
          name: message.channel
        }
      }
    );
    return bot.reply(message,
      'Got it. Standup scheduled '+frequency+' at '+moment(time).format('hh:mm a')+' '+weekday
    );
  });
});

// Add or change a standup message for today in a DM with the bot
// TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
// TODO: update reports when edited
// TODO: parse standup messages
controller.hears(['standup <#(\\S*)>((.|\n)*)'],['direct_message'], function (bot, message) {
  var standupChannel = message.match[1];
  var content = message.match[2];
  models.Channel.findOne({
    where: {
      name: standupChannel
    }
  }).then(function (channel) {
    if (channel) {
      models.Standup.findOrCreate({
        where: {
          channel: standupChannel,
          date: moment().format('YYYY-MM-DD'),
          user: message.user
        }
      }).then(function (standup) {
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
          {
            where: {
              channel: standupChannel,
              date: moment().format('YYYY-MM-DD'),
              user: message.user
            }
          }).then(function (standup) {
            bot.reply(message,'Thanks! Your standup for '+standupChannel+' is recorded');
          });
        }
      );
    } else {
      return bot.reply(message,
        'The '+standupChannel+' channel doesn\'t have any standups set'
      );
    }
  });
});

// I think that these aren't necessary because channel & user are stored as
// unique id rather than display name
// TODO: update channel name if it changes
// TODO: update user name if it changes
