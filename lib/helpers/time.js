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
  // Display in the standard timezone
  return moment.tz(time, timezone).format('h:mm a z');
}

module.exports = {
  getTimeFromString: getTimeFromString,
  getScheduleFormat: getScheduleFormat,
  getDisplayFormat: getDisplayFormat,
  getReportFormat: getReportFormat
};
