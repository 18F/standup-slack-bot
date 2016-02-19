var timeHelper = require('../../lib/helper-time');

module.exports = function() {
  var _timeString = '';

  this.Given(/^The time value (.*)$/, function(timeString) {
    _timeString = timeString;
  });

  this.Then('It should fail', function() {
    var actual = timeHelper.getTimeFromString(_timeString);
    if(actual === '') {
      return true;
    } else {
      throw new Error('Expected to fail, but succeeded');
    }
  });

  this.Then('It should succeed', function() {
    var actual = timeHelper.getTimeFromString(_timeString);
    if(actual !== '') {
      return true;
    } else {
      throw new Error('Expected to succeed, but failed');
    }
  });
}
