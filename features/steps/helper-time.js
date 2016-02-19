var timeHelper = require('../../lib/helper-time');

module.exports = function() {
  var _timeString = '';
  var _createdValue = '';

  this.Given(/^the string (.*)$/, function(timeString) {
    _timeString = timeString;
  });

  this.When("I try to parse it", function() {
    _createdValue = timeHelper.getTimeFromString(_timeString);
  });

  this.Then(/^the time should( not)? parse$/, function(not) {
    if((_createdValue !== '' && !not) || (_createdValue === '' && not)) {
      return true;
    } else {
      throw new Error('Time failed to parse');
    }
  });
};
