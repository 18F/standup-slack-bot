const botHelpers = require('../../helpers');

function getDaysWithOneToggled(days, toggled) {
  let str = days.join(' ');

  // We're toggling a day off
  if(days.indexOf(toggled) >= 0) {
    str = str.replace(toggled, '');
  } else {
    str += ` ${toggled}`;
  }

  return str;
}

function getNewTimeString(time, days, audience, reminderMinutes) {
  return `${time} ${days} | audience:${audience} | reminder:${reminderMinutes}`;
}

module.exports = {
  slackapp(standupTime, audience, reminderMinutes, channel) {
    const time = botHelpers.time.getDisplayFormat(standupTime.time);

    return {
      text: `Alright, here's your standup.  How's it look?`,
      attachments: [
        {
          title: 'Timing',
          text: `Your standup will run at ${time}, on these days:`,
          fallback: `Configure your standup`,
          callback_id: 'create_standup_config',
          color: '#3AA33A',
          attachment_type: 'default',
          actions: [
            {
              name: 'button',
              text: 'Monday',
              type: 'button',
              value: getNewTimeString(time, getDaysWithOneToggled(standupTime.days, 'Monday'), audience, reminderMinutes),
              style: standupTime.days.indexOf('Monday') >= 0 ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: 'Tuesday',
              type: 'button',
              value: getNewTimeString(time, getDaysWithOneToggled(standupTime.days, 'Tuesday'), audience, reminderMinutes),              style: standupTime.days.indexOf('Tuesday') >= 0 ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: 'Wednesday',
              type: 'button',
              value: getNewTimeString(time, getDaysWithOneToggled(standupTime.days, 'Wednesday'), audience, reminderMinutes),
              style: standupTime.days.indexOf('Wednesday') >= 0 ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: 'Thursday',
              type: 'button',
              value: getNewTimeString(time, getDaysWithOneToggled(standupTime.days, 'Thursday'), audience, reminderMinutes),
              style: standupTime.days.indexOf('Thursday') >= 0 ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: 'Friday',
              type: 'button',
              value: getNewTimeString(time, getDaysWithOneToggled(standupTime.days, 'Friday'), audience, reminderMinutes),
              style: standupTime.days.indexOf('Friday') >= 0 ? 'primary' : 'default'
            }
          ]
        },
        {
          title: 'Audience',
          text: 'This audience will be notified for standup reminders:',
          callback_id: 'create_standup_config',
          color: '#3AA33A',
          actions: [
            {
              name: 'button',
              text: 'None',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), 'null', reminderMinutes),
              style: audience === 'null' || audience === null ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: '@here',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), '<@here>', reminderMinutes),
              style: audience === '<@here>' ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: '@channel',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), '<@channel>', reminderMinutes),
              style: audience === '<@channel>' ? 'primary' : 'default'
            }
          ]
        },
        {
          title: 'Reminder',
          text: 'Reminders will be posted this long before the standup:',
          callback_id: 'create_standup_config',
          color: '#3AA33A',
          actions: [
            {
              name: 'button',
              text: '15 minutes',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), audience, '15'),
              style: reminderMinutes === '15' ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: '30 minutes',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), audience, '30'),
              style: reminderMinutes === '30' ? 'primary' : 'default'
            },
            {
              name: 'button',
              text: '60 minutes',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), audience, '60'),
              style: reminderMinutes === '60' ? 'primary' : 'default'

            },
            {
              name: 'button',
              text: '90 minutes',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), audience, '90'),
              style: reminderMinutes === '90' ? 'primary' : 'default'

            }
          ]
        },
        {
          title: '',
          text: '──────────────────────────────\nLook good?',
          callback_id: 'create_standup_submit',
          color: '#FFFFFF',
          actions: [
            {
              name: 'button',
              text: 'save',
              type: 'button',
              value: getNewTimeString(time, standupTime.days.join(' '), audience, reminderMinutes),
              style: 'primary'
            },
            {
              name: 'button',
              text: 'cancel',
              type: 'button',
              value: 'cancel',
              style: 'danger'
            }
          ]
        }
      ],
      channel
    };
  },

  standalone() {
    return { };
  }
};
