require('./env');
const log = require('./getLogger')('app');
const Botkit = require('botkit');
const schedule = require('node-schedule');
const botLib = require('./lib/bot');
const startWebServer = require('./lib/web/start');

// Database setup
const models = require('./models');

// Set to true to reset db on load
models.sequelize.sync({ force: false });

if (!process.env.SLACK_TOKEN) {
  log.error('SLACK_TOKEN not set in environment.');
  process.exit(1);
}

const bkLogger = require('./getLogger')('botkit');

function bkLog(inLevel, ...args) {
  // Remap botkit log levels
  let level = inLevel;
  if (level === 'debug') {
    return;
  } else if (level === 'info') {
    level = 'verbose';
  } else if (level === 'notice') {
    level = 'info';
  }

  let fn;
  let thisObj;

  if (bkLogger[level]) {
    fn = bkLogger[level];
    thisObj = bkLogger;
  } else {
    fn = console.log; // eslint-disable-line no-console
    thisObj = console;
    args.unshift(`[${level}]`);
  }

  fn.apply(thisObj, args);
}

const controller = Botkit.slackbot({
  debug: false,
  logger: { log: bkLog },
  webserver: {
    static_dir: `${__dirname}/lib/web/static`
  }
});

// Initialize the bot
controller.spawn({
  token: process.env.SLACK_TOKEN,
  retry: 5
}).startRTM((startRTMerr, bot) => {
  if (startRTMerr) {
    log.error(startRTMerr);
    throw new Error(startRTMerr);
  } else {
    log.info('Connected to RTM');
    bot.identifyBot((identifyBotErr, identity) => {
      // identity contains...
      // {name, id, team_id}
      log.info(`Bot name: ${identity.name}`);

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

      // Configure in-channel updates
      botLib.setInChannelUpdate(controller);

      // Get a weekly user report
      botLib.userReport(controller);

      // Respond to all other direct messages
      botLib.unhandledDM(controller);

      log.verbose('All bot functions initialized');
    });

    startWebServer(controller);
  }
});
