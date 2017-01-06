const botHelpers = require('../../helpers');
const messageBuilder = require('../message-builders');
const models = require('../../../models');

function getStandupFromText(text) {
  let audience = text.match(/\| audience:(\S+) \|/)[1];
  if(audience === 'null') {
    audience = null;
  } else {
    audience = audience.replace('&gt;', '>').replace('&lt;', '<');
  }

  const scheduled = botHelpers.time.getTimeFromString(text);
  const reminder = text.match(/\| reminder:(\d+)$/)[1];

  return {
    scheduled, audience, reminder
  };
}

module.exports = {
  edit(bot, message) {
    const standup = getStandupFromText(message.text);
    const update = messageBuilder.standupConfig(standup.scheduled, standup.audience, standup.reminder, message.channel);
    update.replace_original = true;
    update.response_type = 'ephemeral';

    bot.replyInteractive(message, update);
  },

  submit(bot, message) {
    if(message.text === 'cancel') {
      bot.replyInteractive(message, {
        text: 'Okay, no worries. Your standup was not saved',
        replace_original: true,
        response_type: 'ephemeral',
      });
    } else {
      const standup = getStandupFromText(message.text);
      const scheduleTime = botHelpers.time.getScheduleFormat(standup.scheduled.time);
      let reminderTime = null;
      if(Number(standup.reminder) > 0) {
        reminderTime = botHelpers.time.getReminderFormat(scheduleTime, Number(standup.reminder));
      }

      models.Channel.upsert({
        name: message.channel,
        time: scheduleTime,
        reminderMinutes: Number(standup.reminder),
        reminderTime: reminderTime,
        audience: standup.audience,
        monday: standup.scheduled.days.indexOf('Monday') >= 0,
        tuesday: standup.scheduled.days.indexOf('Tuesday') >= 0,
        wednesday: standup.scheduled.days.indexOf('Wednesday') >= 0,
        thursday: standup.scheduled.days.indexOf('Thursday') >= 0,
        friday: standup.scheduled.days.indexOf('Friday') >= 0
      }).then(() => {
        bot.replyInteractive(message, {
          text: `Standup scheduled for ${botHelpers.time.getDisplayFormat(scheduleTime)} on ${botHelpers.time.getDisplayFormatForDays(standup.scheduled.days)}. Thanks <@${message.user}>!`,
          delete_original: true,
          response_type: 'in_channel'
        })
      });
    }
  }
}
