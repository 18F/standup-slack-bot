'use strict';

var moment = require('moment');

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
  return moment(time).format('hh:mm a');
}

module.exports = {
  getTimeFromString: getTimeFromString,
  getScheduleFormat: getScheduleFormat,
  getDisplayFormat: getDisplayFormat,
  getReportFormat: getReportFormat
};
