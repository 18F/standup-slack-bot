

const log = require('../../getLogger')('remove standup');
const models = require('../../models');

function removeStandup(bot, message) {
  log.verbose(`Heard a request to remove a standup: \n${message.match[0]}`);
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then((channel) => {
    if (channel) {
      models.Channel.destroy({
        where: {
          name: message.channel
        }
      }).then(() => {
        log.info(`Channel removed: ${channel}`);
        bot.reply(message, 'Standup removed :thumbsup:');
      });
    } else {
      bot.reply(message, 'This channel doesn\'t have a standup scheduled');
    }
  });
}

function attachListener(controller) {
  controller.hears(['(remove|delete) standup'], ['direct_mention'], removeStandup);
  log.verbose('Attached');
}

module.exports = attachListener;
