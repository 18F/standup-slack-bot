function s(count) {
  return count === 1 ? '' : 's';
}

module.exports = {
  slackapp(audience, minutes, channel) {
    return {
      attachments: [{
        title: 'Standup Time',
        text: `Hey ${audience}!  There's a standup in ${minutes} minute${s(minutes)}!  Click below to get started submitting your standup.`,
        fallback: `${audience} :hourglass: There's a standup in ${minutes} minute${s(minutes)}! To submit your standup, DM me! Or, add any emoji to this message and I'll DM you to get your standup info.`,
        callback_id: 'standup_reminder',
        color: '#3AA33A',
        attachment_type: 'default',
        actions: [
          {
            name: 'button',
            text: 'Interview me',
            type: 'button',
            style: 'primary',
            value: 'start_interview'
          },
          {
            name: 'button',
            text: 'Set me Out of Office',
            type: 'button',
            value: 'set_ooo'
          }
        ],
        thumb_url: `${process.env.URL}/standup-bot.png`
      }],
      channel: channel
    };
  },

  standalone(audience, minutes, channel) {
    return {
      text: `${audience} :hourglass: There's a standup in ${minutes} minute${s(minutes)}! To submit your standup, DM me! Or, add any emoji to this message and I'll DM you to get your standup info.`,
      attachments: [],
      channel: channel
    };
  }
};
