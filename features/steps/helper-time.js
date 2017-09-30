const timeHelper = require('../../lib/helpers').time;

module.exports = function helperTimeTests() {
  let timeString = '';
  let parsedValue = '';
  let baseTime = null;
  let formattedTime = '';
  let convertedTime = '';

  this.Given(/^the string (.*)$/, (timeStringFromSetup) => {
    timeString = timeStringFromSetup;
  });

  this.Given(/^the input time (.*)$/, (time) => {
    if (time !== '') {
      baseTime = timeHelper.getTimeFromString(time).time;
    } else {
      baseTime = null;
    }
  });

  this.Given(/^the database time (.*)$/, (time) => {
    if (time !== '') {
      baseTime = time;
    } else {
      baseTime = null;
    }
  });

  this.When('I try to parse it', () => {
    parsedValue = timeHelper.getTimeFromString(timeString);
  });

  this.When('I ask for the schedule format', () => {
    formattedTime = timeHelper.getScheduleFormat(baseTime);
  });

  this.When('I ask for the report format', () => {
    formattedTime = timeHelper.getReportFormat(baseTime);
  });

  this.When('I ask for the display format', () => {
    formattedTime = timeHelper.getDisplayFormat(baseTime);
  });

  this.When(/I set a reminder for (\S*) minutes/, (minutes) => {
    convertedTime = timeHelper.getReminderFormat(baseTime, minutes);
  });

  this.Then(/^the time should( not)? parse$/, (not) => {
    if ((parsedValue !== false && !not) || (parsedValue === false && not)) {
      return true;
    }
    throw new Error('Time failed to parse');
  });

  this.Then(/^the result matches (.*)$/, (pattern) => {
    if (!formattedTime.match(new RegExp(pattern))) {
      throw new Error(`Expected "${formattedTime}" to match "${pattern}"`);
    }
  });

  this.Then(/^the result is (.*)$/, (pattern) => {
    if (convertedTime !== pattern) {
      throw new Error(`Expected "${convertedTime}" to match "${pattern}"`);
    }
  });
};
