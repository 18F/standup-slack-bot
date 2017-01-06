'use strict';

require('./env');

// If there's a client ID and secret, assume it's configured
// to run as an app.  Set this flag before loading the other
// modules as they may depend on it.
process.env.IS_APP = false;
if(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET) {
  process.env.IS_APP = true;
}

var log = require('./getLogger')('app');
var Botkit = require('botkit');
var schedule = require('node-schedule');
var botLib = require('./lib/bot');
var startWebServer = require('./lib/web/start');
var cfenv = require('cfenv');

// Database setup
var models = require('./models');
models.sequelize.sync(
  // Set to true to reset db on load
  {force: false}
);

if (!process.env.SLACK_TOKEN) {
  log.error('SLACK_TOKEN not set in environment.');
  process.exit(1);
}

// Custom botkit logger
var bkLogger = require('./getLogger')('botkit');
function bkLog(level) {
  var args = [ ];
  for(var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }

  // Remap botkit log levels
  if(level === 'debug') {
    return;
  }
  else if(level === 'info') {
    level = 'verbose';
  } else if(level === 'notice') {
    level = 'info';
  }

  var fn, thisObj;
  if(bkLogger[level]) {
    fn = bkLogger[level];
    thisObj = bkLogger;
  } else {
    fn = console.log;
    thisObj = console;
    args.unshift('[' + level + ']');
  }

  fn.apply(thisObj, args);
}

var controller = Botkit.slackbot({
  debug: false,
  logger: { log: bkLog },
  webserver: {
    static_dir: `${__dirname}/lib/web/static`
  }
});

let hookupEndpoints = () => { };
if(process.env.IS_APP) {
  log.verbose('Running as a Slack app');
  hookupEndpoints = () => {
    log.verbose('Attaching webhook endpoints');
    controller.createWebhookEndpoints(controller.webserver, process.env.SLACK_VERIFICATION_CODE);
  }
}

// Only hook up the webhook endpoints if this is running as an app.
startWebServer(controller).then(hookupEndpoints);

// Initialize the bot
controller.spawn({
  token: process.env.SLACK_TOKEN,
  retry: 5
}).startRTM(function(err, bot) {
  if (err) {
    log.error(err);
    process.exit(1);
  } else {
    log.info('Connected to RTM');
    bot.identifyBot(function(err,identity) {

      // Persist the team ID in the controller's datastore. This is necessary
      // for message button responses.
      controller.storage.teams.save({ id: identity.team_id, bot: { name: identity.name, id: identity.id} }, (err) => {
        if(err) {
          log.error(err);
        } else {
          log.info(`Persisted team id: ${identity.team_id}`);
        }
      });

      // identity contains...
      // {name, id, team_id}
      log.info('Bot name: ' + identity.name);

      // Set up cron job to check every minute for channels that need a standup report
      schedule.scheduleJob('* * * * 1-5', botLib.getReportRunner(bot));
      schedule.scheduleJob('* * * * 1-5', botLib.getReminderRunner(bot));

      // TODO: method to set standup frequency
      // TODO: add usage messages
      botLib.giveHelp(controller, identity.name);

      // Set yourself OOO for some time.  Put this above getStandupInfo
      // because getStandupInfo catches anything that starts with "#channel",
      // so catch the more precise
      botLib.setOutOfOffice(controller);

      botLib.getStandupInfo(controller);

      // TODO: remind people to do standup?
      botLib.setReminder(controller);

      // Message for when the bot is added to a channel
      botLib.joinChannel(controller, identity.name);

      // Create a standup in a channel
      botLib.createStandup(controller);

      // Add or change a standup message for today in a DM with the bot
      botLib.getUserStandupInfo(controller);

      // DM a user when they ask to be interviewed or
      // they react to a reminder DM
      botLib.startInterview(controller);
      botLib.startDmEmoji(controller, identity.id);

      // Remove a standup
      botLib.removeStandup(controller);

      // Set a standup audience to a user group
      botLib.setAudience(controller);

      // Get a weekly user report
      botLib.userReport(controller);

      // Interactive message handling
      botLib.interactive.interactive(controller, bot);

      // I think that these aren't necessary because channel & user are stored as
      // unique id rather than display name
      // TODO: update channel name if it changes
      // TODO: update user name if it changes

      log.verbose('All bot functions initialized');
    });
  }
});
