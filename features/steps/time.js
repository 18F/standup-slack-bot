'use strict';
var sinon = require('sinon');
var fedHolidays = require('@18f/us-federal-holidays');

var fakeTimers = null;

module.exports = function() {

  // Fake timers with sinon if they haven't been
  // setup already.  Set the internal time to now.
  // (Sinon defaults to the epoch).
  var setupFakeTimers = (function() {
    if(!fakeTimers) {
      fakeTimers = sinon.useFakeTimers(Date.now());
    }
  });

  this.Given('it is a weekday', function() {
    setupFakeTimers();

    // Go backwards one day at a time until we land
    // on a day that is neither Sunday (0) or
    // Saturday (6).  Go backwards because if we
    // go forward, you will trigger cucumber's
    // test timeout logic.
    var date = new Date();
    while(date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a weekend', function() {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on Saturday or Sunday.
    var date = new Date();
    while(date.getDay() !== 0 && date.getDay() !== 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is not a holiday', function() {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on a weekday that isn't a holiday.
    var date = new Date();
    while(fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a holiday', function() {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on a weekday that is a holiday.
    var date = new Date();
    while(!fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  // Reset fake timers
  this.After = function() {
    if(fakeTimers) {
      fakeTimers.restore();
    }
  };
};

// Provide a mechanism for manually resetting the
// timers if needed.
module.exports.resetTimers = function() {
  if(fakeTimers) {
    fakeTimers.restore();
    fakeTimers = null;
  }
};
