var timeHelper = require('../../lib/helper-time');

module.exports = function() {
  var _timeString = '';

  this.Given(/^the time value (.*)$/, function(timeString) {
    _timeString = timeString;
  });

  this.Then('it should fail', function() {
    var actual = timeHelper.getTimeFromString(_timeString);
    if(actual === '') {
      return true;
    } else {
      throw new Error('Expected to fail, but succeeded');
    }
  });

  this.Then('it should succeed', function() {
    var actual = timeHelper.getTimeFromString(_timeString);
    if(actual !== '') {
      return true;
    } else {
      throw new Error('Expected to succeed, but failed');
    }
  });
}
