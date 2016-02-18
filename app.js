'use strict';

var Botkit = require('botkit');
var schedule = require('node-schedule');
require('dotenv').config();

// Database setup
var models = require('./models');
models.sequelize.sync(
  // Set to true to reset db on load
  {force: true}
);

// Check for a Slack token
if (!process.env.SLACK_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  debug: false
});

// Initialize the bot
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM(function(err, bot) {
  if (err) {
    throw new Error(err);
  } else {
    //anytimeBot = bot;
    bot.identifyBot(function(err,identity) {
      //me = identity.name;
      // identity contains...
      // {name, id, team_id}

      // Set up cron job to check every minute for channels that need a standup report
      schedule.scheduleJob('* * * * *', require('./lib/runReports')(bot));

      // TODO: method to set standup frequency
      // TODO: add usage messages
      // TODO: remind people to do standup?

      // Message for when the bot is added to a channel
      require('./lib/bot-joinChannel')(controller, identity.name);

      // Create a standup in a channel
      require('./lib/createStandup')(controller);

      // Add or change a standup message for today in a DM with the bot
      require('./lib/getUserStandupInfo')(controller);

      // I think that these aren't necessary because channel & user are stored as
      // unique id rather than display name
      // TODO: update channel name if it changes
      // TODO: update user name if it changes
    });
  }
});
