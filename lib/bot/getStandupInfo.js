const models = require('../../models');
const timeHelper = require('../helpers').time;

function GetStandupInfo(bot, message) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then((channel) => {
    if (channel) {
      bot.reply(message, `There's a standup scheduled for ${
        timeHelper.getDisplayFormat(channel.time)} on ${
        timeHelper.getDisplayFormatForDaysOfChannel(channel)}`);
    } else {
      bot.reply(message, 'There\'s no standup scheduled yet.');
    }
  });
}

function attachListener(controller) {
  controller.hears(['^when'], ['direct_mention'], GetStandupInfo);
}

module.exports = attachListener;
