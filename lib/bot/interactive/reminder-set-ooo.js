const log = require('../../../getLogger')('slack web | set user ooo');
const models = require('../../../models');
const helpers = require('../../helpers');

module.exports = function reminderSetOOO(bot, message) {
  // Go get the user's real name and thumbnail, since those go
  // into the standup report
  bot.api.users.info({'user': message.user}, (err, response) => {
    const userRealName = response.user.real_name || response.user.name;
    const thumbUrl = response.user.profile.image_72;

    models.Standup.findOrCreate({
      where: {
        channel: message.channel,
        date: helpers.time.getReportFormat(),
        user: message.user
      }
    }).then(standupArr => {
      const standup = standupArr[0];
      standup.userRealName = userRealName;
      standup.thumbUrl = thumbUrl;
      standup.today = 'Out of Office';
      standup.save().then(() => {
        // Then once it's saved, let the user know.
        bot.replyInteractive(message, {
          replace_original: false,
          delete_original: false,
          response_type: 'ephemeral',
          text: `Okay, I've marked you out-of-office for the day!`
        });
      });
    });
});
};
