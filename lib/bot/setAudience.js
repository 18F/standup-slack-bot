const log = require('../../getLogger')('set audience');
const models = require('../../models');

function setUserGroup(bot, message) {
  log.verbose('Heard a request to set an audience');
  // Currently, bots cannot access the usergroups api endpoint, so we can't check
  // See https://api.slack.com/bot-users

  // var userGroups = [];
  // bot.api.usergroups.list({}, function(err, response) {
  //   if (err) {
  //     log.error('API Error: '+err);
  //   } else {
  //     _.each(response.usergroups, function(group) {
  //       userGroups.push(group.handle);
  //     });
  //   }
  // });
  // console.log(userGroups);
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then((channel) => {
    if (channel) {
      models.Channel.update(
        {
          audience: message.match[2]
        },
        {
          where: {
            name: channel.name
          }
        }
      ).then(() => {
        bot.reply(message, `:thumbsup: Set audience to \`${message.match[2]}\`. If you're using a ` +
        'user group, make sure that it exists');
      });
    } else {
      bot.reply(
        message,
        'There\'s no standup scheduled yet. Create one before setting an audience'
      );
    }
  });
}

function attachListener(controller) {
  controller.hears(['(usergroup|audience) (<!(subteam|here|channel).*?>)'], ['direct_mention'], setUserGroup);
  log.verbose('Attached');
}

module.exports = attachListener;
