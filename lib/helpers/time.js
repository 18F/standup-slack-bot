const moment = require('moment-timezone');

const timezone = process.env.TIMEZONE || 'America/New_York';

function getTimeFromString(str) {
  let time = str.match(/((\d+|:)*(\s)?((a|p)m)|\d{4})/gi);
  const daysPortion = str.replace(time, '').trim();

  if (time) {
    // Assume incoming strings are in the standard timezone
    time = moment.tz(time[0], ['h:mm a', 'hmm a', 'hmma', 'HHmm', 'hha', 'hh a'], timezone);

    const output = {
      time,
      days: []
    };

    if (time.isValid()) {
      let gotOneDay = false;
      [
        { regex: 'm(o|onday)?', day: 'Monday' },
        { regex: 't(u|uesday)?', day: 'Tuesday' },
        { regex: 'w(e|ednesday)?', day: 'Wednesday' },
        { regex: 'th(ursday)?', day: 'Thursday' },
        { regex: 'f(r|riday)?', day: 'Friday' }
      ].forEach((weekday) => {
        if ((new RegExp(`(^|\\s)${weekday.regex}($|\\s)`, 'i')).test(daysPortion)) {
          output.days.push(weekday.day);
          gotOneDay = true;
        }
      });

      if (!gotOneDay) {
        output.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      }

      return output;
    }
  }
  return false;
}

function getScheduleFormat(inTime) {
  let time = inTime;
  if (!time) {
    time = moment.tz(timezone);
  }
  return moment(time).format('HHmm');
}

function getScheduleDay() {
  return moment().format('dddd').toLowerCase();
}

function getReportFormat(inTime) {
  let time = inTime;
  if (!time) {
    time = moment();
  }
  return moment.tz(time, timezone).format('YYYY-MM-DD');
}

function getDisplayFormat(inTime) {
  let time = inTime;
  if (!time) {
    time = moment();
  }

  // For cases where the time is coming directly
  // from the database, it'll be a number.
  if (typeof time === 'number') {
    // Time has to be 4 digits for moment
    // to parse it properly, but a number
    // won't have leading zeroes. Stringify
    // and prepend zeroes as necessary.
    time = String(time);
    while (time.length < 4) {
      time = `0${time}`;
    }
  }

  // Display in the standard timezone
  return moment.tz(time, 'HHmm', timezone).format('h:mm a z');
}

function getDisplayFormatForDays(days) {
  if (days.length === 5) {
    return 'all weekdays';
  } else if (days.length <= 1) {
    return days[0] || 'no days';
  }

  const last = days[days.length - 1];
  const rest = days.slice(0, days.length - 1);

  return `${rest.join(', ')} and ${last}`;
}

function getDisplayFormatForDaysOfChannel(channel) {
  const days = [];
  const dow = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dow.forEach((day) => {
    if (channel.get(day.toLowerCase())) {
      days.push(day);
    }
  });
  return getDisplayFormatForDays(days);
}

function getCurrentDate() {
  return moment.tz(timezone).format('YYYY-MM-DD');
}

function getReminderFormat(inTime, minutes) {
  if (minutes === null) {
    return null;
  }
  let time = String(inTime);
  while (time.length < 4) {
    time = `0${time}`;
  }
  return moment(time, 'HHmm').subtract(minutes, 'minutes').format('HHmm');
}

function datesAreSameDay(date1, date2) {
  return getReportFormat(date1) === getReportFormat(date2);
}

module.exports = {
  getTimeFromString,
  getScheduleFormat,
  getScheduleDay,
  getDisplayFormat,
  getDisplayFormatForDays,
  getDisplayFormatForDaysOfChannel,
  getReportFormat,
  getCurrentDate,
  getReminderFormat,
  datesAreSameDay
};
