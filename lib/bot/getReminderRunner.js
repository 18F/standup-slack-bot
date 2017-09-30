const log = require('../../getLogger')('reminder runner');
const models = require('../../models');
const helpers = require('../helpers');
const fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
  const time = helpers.time.getScheduleFormat();

  // Don't run if today is a federal holiday
  if (fedHolidays.isAHoliday()) {
    return;
  }

  // Find channels that want a reminder at this minute
  const where = {
    reminderTime: time
  };
  where[helpers.time.getScheduleDay()] = true;

  models.Channel.findAll({
    where
  }).then((channels) => {
    if (channels.length > 0) {
      log.info(`Sending reminders for ${channels.length} channel(s)`);

      // Iterate over the channels
      for (const channel of channels) {
        // Set report audience
        const audience = channel.audience === null ? '<!here>' : `@${channel.audience}`;

        const reminder = {
          text: `${audience} :hourglass: There's a standup in ${channel.reminderMinutes} minutes! ` +
             'To submit your standup, DM me! Or, add any emoji to this message and I\'ll DM you to get your standup info.',
          attachments: [],
          channel: channel.name
        };
        anytimeBot.say(reminder, (err, response) => {
          if (!err) {
            anytimeBot.api.reactions.add({
              name: 'wave',
              channel: channel.name,
              timestamp: response.message.ts
            });
          }
        });
      }
    }
  });
}

module.exports = anytimeBot => (() => runReports(anytimeBot));
