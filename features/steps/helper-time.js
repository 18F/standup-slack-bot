'use strict';

var timeHelper = require('../../lib/helpers').time;

module.exports = function() {
  var _timeString = '';
  var _parsedValue = '';
  var _baseTime = null;
  var _formattedTime = '';
  var _convertedTime = '';

  this.Given(/^the string (.*)$/, function(timeString) {
    _timeString = timeString;
  });

  this.Given(/^the input time (.*)$/, function(time) {
    if(time !== '') {
      _baseTime = timeHelper.getTimeFromString(time).time;
    } else {
      _baseTime = null;
    }
  });

  this.Given(/^the database time (.*)$/, function(time) {
    if(time !== '') {
      _baseTime = time;
    } else {
      _baseTime = null;
    }
  });

  this.When('I try to parse it', function() {
    _parsedValue = timeHelper.getTimeFromString(_timeString);
  });

  this.When('I ask for the schedule format', function() {
    _formattedTime = timeHelper.getScheduleFormat(_baseTime);
  });

  this.When('I ask for the report format', function() {
    _formattedTime = timeHelper.getReportFormat(_baseTime);
  });

  this.When('I ask for the display format', function() {
    _formattedTime = timeHelper.getDisplayFormat(_baseTime);
  });

  this.When(/I set a reminder for (\S*) minutes/, function(minutes) {
    _convertedTime = timeHelper.getReminderFormat(_baseTime, minutes);
  });

  this.Then(/^the time should( not)? parse$/, function(not) {
    if((_parsedValue !== false && !not) || (_parsedValue === false && not)) {
      return true;
    } else {
      throw new Error('Time failed to parse');
    }
  });

  this.Then(/^the result matches (.*)$/, function(pattern) {
    if(!_formattedTime.match(new RegExp(pattern))) {
      throw new Error('Expected "' + _formattedTime + '" to match "' + pattern + '"');
    }
  });

  this.Then(/^the result is (.*)$/, function(pattern) {
    if (_convertedTime !== pattern) {
      throw new Error('Expected "' + _convertedTime + '" to match "' + pattern + '"');
    }
  });
};
