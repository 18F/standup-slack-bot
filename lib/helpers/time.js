'use strict';

var moment = require('moment-timezone');
var timezone = 'America/New_York';

function getTimeFromString(str) {
  var time = str.match(/((\d+|:)*(\s)?((a|p)m)|\d{4})/gi);
  var daysPortion = str.replace(time, '').trim();

  if(time) {
    // Assume incoming strings are in the standard timezone
    time = moment.tz(time[0], ['h:mm a','hmm a','hmma','HHmm','hha','hh a'], timezone);

    var output = {
      time: '',
      days: [ ]
    };

    // But return everything in UTC
    if(time.isValid()) {
      output.time = moment.utc(time);

      var gotOneDay = false;
      [
        { regex: 'mo?', day: 'Monday' },
        { regex: 'tu?', day: 'Tuesday' },
        { regex: 'we?', day: 'Wednesday' },
        { regex: 'th', day: 'Thursday' },
        { regex: 'fr?', day: 'Friday' }
      ].forEach(function(weekday) {
        if((new RegExp(`(^|\\s)${weekday.regex}($|\\s)`, 'i')).test(daysPortion)) {
          output.days.push(weekday.day);
          gotOneDay = true;
        }
      });

      if(!gotOneDay) {
        output.days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ];
      }

      return output;
    }
  }
  return false;
}

function getScheduleFormat(time) {
  if(!time) {
    time = moment();
  }
  return moment.utc(time).format('HHmm');
}

function getScheduleDay() {
  return moment.utc().format('dddd').toLowerCase();
}

function getReportFormat(time) {
  if(!time) {
    time = moment();
  }
  return moment.tz(time, timezone).format('YYYY-MM-DD');
}

function getDisplayFormat(time) {
  if(!time) {
    time = moment();
  }

  // For cases where the time is coming directly
  // from the database, it'll be a number.
  if(typeof time === 'number') {
    // Time has to be 4 digits for moment
    // to parse it properly, but a number
    // won't have leading zeroes. Stringify
    // and prepend zeroes as necessary.
    var time = String(time);
    while(time.length < 4) {
      time = '0' + time;
    }
  }
  time = moment.utc(time, 'HHmm');

  // Display in the standard timezone
  return moment.tz(time, timezone).format('h:mm a z');
}

function getDisplayFormatForDaysOfChannel(channel) {
  const days = []
  const dow = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  dow.forEach(function (day) {
    if (channel.get(day.toLowerCase())) {
      days.push(day);
    }
  })
  return getDisplayFormatForDays(days)
}

function getDisplayFormatForDays(days) {
  if(days.length === 5) {
    return 'all weekdays';
  } else if (days.length <= 1) {
    return days[0] || 'no days';
  }

  const last = days[days.length - 1];
  const rest = days.slice(0, days.length - 1);

  return rest.join(', ') + ' and ' + last;
}

function getCurrentDate () {
  return moment.tz(timezone).format('YYYY-MM-DD');
}

function getReminderFormat (time, minutes) {
  if (minutes === null) {
    return null;
  }
  time = String(time);
  while(time.length < 4) {
    time = '0' + time;
  }
  return moment(time,'HHmm').subtract(minutes, 'minutes').format('HHmm');
}

function datesAreSameDay(date1, date2) {
  return getReportFormat(date1) === getReportFormat(date2);
}

module.exports = {
  getTimeFromString: getTimeFromString,
  getScheduleFormat: getScheduleFormat,
  getScheduleDay: getScheduleDay,
  getDisplayFormat: getDisplayFormat,
  getDisplayFormatForDays: getDisplayFormatForDays,
  getDisplayFormatForDaysOfChannel: getDisplayFormatForDaysOfChannel,
  getReportFormat: getReportFormat,
  getCurrentDate: getCurrentDate,
  getReminderFormat: getReminderFormat,
  datesAreSameDay: datesAreSameDay
};
