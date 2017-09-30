

const timeHelper = require('../../lib/helpers').time;

module.exports = function () {
  let _timeString = '';
  let _parsedValue = '';
  let _baseTime = null;
  let _formattedTime = '';
  let _convertedTime = '';

  this.Given(/^the string (.*)$/, (timeString) => {
    _timeString = timeString;
  });

  this.Given(/^the input time (.*)$/, (time) => {
    if (time !== '') {
      _baseTime = timeHelper.getTimeFromString(time).time;
    } else {
      _baseTime = null;
    }
  });

  this.Given(/^the database time (.*)$/, (time) => {
    if (time !== '') {
      _baseTime = time;
    } else {
      _baseTime = null;
    }
  });

  this.When('I try to parse it', () => {
    _parsedValue = timeHelper.getTimeFromString(_timeString);
  });

  this.When('I ask for the schedule format', () => {
    _formattedTime = timeHelper.getScheduleFormat(_baseTime);
  });

  this.When('I ask for the report format', () => {
    _formattedTime = timeHelper.getReportFormat(_baseTime);
  });

  this.When('I ask for the display format', () => {
    _formattedTime = timeHelper.getDisplayFormat(_baseTime);
  });

  this.When(/I set a reminder for (\S*) minutes/, (minutes) => {
    _convertedTime = timeHelper.getReminderFormat(_baseTime, minutes);
  });

  this.Then(/^the time should( not)? parse$/, (not) => {
    if ((_parsedValue !== false && !not) || (_parsedValue === false && not)) {
      return true;
    }
    throw new Error('Time failed to parse');
  });

  this.Then(/^the result matches (.*)$/, (pattern) => {
    if (!_formattedTime.match(new RegExp(pattern))) {
      throw new Error(`Expected "${_formattedTime}" to match "${pattern}"`);
    }
  });

  this.Then(/^the result is (.*)$/, (pattern) => {
    if (_convertedTime !== pattern) {
      throw new Error(`Expected "${_convertedTime}" to match "${pattern}"`);
    }
  });
};
