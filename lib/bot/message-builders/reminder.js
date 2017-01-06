module.exports = {
  slackapp(audience, minutes, channel) {
    return {
      attachments: [{
        title: 'Standup Time',
        text: `Hey ${audience}!  There's a standup in ${minutes} minutes!  Click below to get started submitting your standup.`,
        fallback: `${audience} :hourglass: There's a standup in ${minutes} minutes! To submit your standup, DM me! Or, add any emoji to this message and I'll DM you to get your standup info.`,
        callback_id: 'start_standup_interview',
        color: '#3AA33A',
        attachment_type: 'default',
        actions: [
          {
            name: 'button',
            text: 'Interview me',
            type: 'button',
            value: 'start_interview'
          }
        ],
        thumb_url: `${process.env.URL}/standup-bot.png`
      }],
      channel: channel
    };
  },

  standalone(audience, minutes, channel) {
    return {
      text: `${audience} :hourglass: There's a standup in ${minutes} minutes! To submit your standup, DM me! Or, add any emoji to this message and I'll DM you to get your standup info.`,
      attachments: [],
      channel: channel
    };
  }
};
