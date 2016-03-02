'use strict';

var moment = require('moment');

function getFourDigitTime(time) {
  time = String(time);
  while(time.length < 4) {
    time = '0' + time;
  }
  return time;
}

function getUTCTimeAssumingEastern(baseTime) {
  baseTime = baseTime.substr(0, 2) + ':' + baseTime.substr(2);
  var now = new Date();

  // Use the current date, and append the time.  Let Javascript figure
  // out the correct UTC time from that, taking dates and junk into account.
  var parseableString = (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + '/' + now.getUTCFullYear() + ' ' + baseTime + ' EST';
  var easternTime = new Date(Date.parse(parseableString));
  var utcTime = (easternTime.getUTCHours() * 100) + easternTime.getUTCMinutes();

  return getFourDigitTime(utcTime);
}

function getCurrentUTCTime() {
  var now = new Date();
  return getFourDigitTime(String(now.getUTCHours()) + String(now.getUTCMinutes()));
}

function getTimeFromString(str) {
  var time = str.match(/((\d+|:)*(\s)?((a|p)m)|\d{4})/gi);
  if(time) {
    time = moment(time[0], ['h:mm a','hmm a','hmma','HHmm','hha','hh a']);
    if(time.isValid()) {
      return time;
    }
  }
  return '';
}

function getScheduleFormat(time) {
  if(!time) {
    time = new Date();
  }
  return moment(time).format('HHmm');
}

function getReportFormat(time) {
  if(!time) {
    time = new Date();
  }
  return moment(time).format('YYYY-MM-DD');
}

function getDisplayFormat(time) {
  if(!time) {
    time = new Date();
  }
  return moment(time).format('h:mm a');
}

module.exports = {
  getTimeFromString: getTimeFromString,
  getScheduleFormat: getScheduleFormat,
  getDisplayFormat: getDisplayFormat,
  getReportFormat: getReportFormat,
  getCurrentUTCTime: getCurrentUTCTime,
  getUTCTimeAssumingEastern: getUTCTimeAssumingEastern
};
