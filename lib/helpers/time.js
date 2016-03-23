'use strict';

var moment = require('moment-timezone');
var timezone = 'America/New_York';

function getTimeFromString(str) {
  var time = str.match(/((\d+|:)*(\s)?((a|p)m)|\d{4})/gi);
  if(time) {
    // Assume incoming strings are in the standard timezone
    time = moment.tz(time[0], ['h:mm a','hmm a','hmma','HHmm','hha','hh a'], timezone);
    if(time.isValid()) {
      // But return everything in UTC
      return moment.utc(time);
    }
  }
  return '';
}

function getScheduleFormat(time) {
  if(!time) {
    time = moment();
  }
  return moment.utc(time).format('HHmm');
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

module.exports = {
  getTimeFromString: getTimeFromString,
  getScheduleFormat: getScheduleFormat,
  getDisplayFormat: getDisplayFormat,
  getReportFormat: getReportFormat,
  getReminderFormat: getReminderFormat
};
