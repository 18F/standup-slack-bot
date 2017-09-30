const models = require('../../models');
const helpers = require('../helpers');
const log = require('../../getLogger')('user report');

function userReport(bot, message) {
  log.verbose('Got a request for a user report');
  const channel = /<#C\w+>/.test(message.text) ? message.text.match(/<#(C\w+)>/)[1] : message.channel;
  const user = /<@U\w+>/.test(message.text) ? message.text.match(/<@(U\w+)>/)[1] : message.user;
  const days = /\s\d+(\s|$)/.test(message.text) ? message.text.match(/\s(\d+)(\s|$)/)[1] : 7;
  models.Standup.findAll({
    where: {
      channel,
      user,
      createdAt: {
        $gt: new Date(new Date() - (days * 24 * 60 * 60 * 1000))
      }
    }
  }).then((standups) => {
    // Begin a Slack message for this channel
    // https://api.slack.com/docs/attachments
    const report = {
      attachments: [],
      channel
    };
    const attachments = [];

    // Iterate over this channels standup messages
    for (const standup of standups) {
      attachments.push(helpers.getUserReport(standup));
    }

    // Create summary statistics
    const fields = [];

    // Find common channels
    const regex = /<#\w+>/g;
    let search;
    const results = {};
    let commonChannels = '';

    while ((search = regex.exec(JSON.stringify(attachments))) !== null) { // eslint-disable-line no-cond-assign
      if (results[search[0]]) {
        results[search[0]] += 1;
      } else {
        results[search[0]] = 1;
      }
    }
    for (const i in results) {
      if (results[i] > 1) {
        // common[i] = results[i];
        commonChannels += `- ${i} (${results[i]})\n`;
      }
    }

    // Find total number of standups
    const { length } = attachments;

    // Assemble stats
    fields.push({
      title: 'Days reported',
      value: length,
      short: true
    });
    if (commonChannels.length >= 1) {
      fields.push({
        title: 'Common projects',
        value: commonChannels,
        short: false
      });
    }

    // Add starter attachment
    attachments.unshift({
      fallback: `Report for ${user} in ${channel}`,
      title: 'Summary',
      fields
    });

    report.attachments = attachments;
    bot.reply(message, report, (err) => {
      if (err) {
        log.error(err);
      }
    });
  });
}

function attachListener(controller) {
  controller.hears(['^report'], ['direct_mention', 'direct_message'], userReport);
  log.verbose('Attached');
}

module.exports = attachListener;
