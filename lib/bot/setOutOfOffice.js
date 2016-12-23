'use strict';

const moment = require('moment');
const models = require('../../models');
const helpers = require('../helpers');
const log = require('../../getLogger')('set ooo');

function setUserOOOForDate(user, username, thumb, channel, date) {
  return models.Standup.findOrCreate({
    where: {
      channel,
      date,
      user
    }
  }).then(standupArr => {
    const standup = standupArr[0];
    standup.userRealName = username;
    standup.thumbUrl = thumb;
    standup.today = 'Out of Office';
    return standup.save();
  })
}

function setOOO(bot, message) {
  models.Channel.findOne({
    where: {
      name: message.channel
    }
  }).then(channel => {
    if (channel) {
      const days = Number(message.match[4]);
      const today = helpers.time.getReportFormat();
      const target = moment(today, 'YYYY-MM-DD');

      bot.api.users.info({'user':message.user}, function(err, response) {
        const userRealName = response.user.real_name || response.user.name;
        const thumbUrl = response.user.profile.image_72;

        const awaiting = [];

        for(let i = 0; i < days; i++) {
          target.add(1, 'd');
          awaiting.push(
            setUserOOOForDate(
              message.user,
              userRealName,
              thumbUrl,
              message.channel,
              helpers.time.getReportFormat(target)
            )
          );
        }

        Promise.all(awaiting).then(() => {
          bot.reply(message, `Okay, <@${message.user}>, I've marked you out-of-office for the next ${days} days!`);
        });
      });
    } else {
      bot.reply(message, `There's no standup scheduled for <#${message.channel}>`);
    }
  });
}

function attachListener(controller) {
  controller.hears(['(ooo()( for)?) (\\d+)', '(out of (the )?office( for)?) (\\d+)'],['direct_mention'], setOOO);
  log.verbose('Attached');
}

module.exports = attachListener;
