'use strict';
var sinon = require('sinon');
var fedHolidays = require('@18f/us-federal-holidays');

module.exports = function() {
  var fakeTimers = null;

  var setupFakeTimers = (function() {
    if(!fakeTimers) {
      fakeTimers = sinon.useFakeTimers(Date.now());
      this.After = function() {
        fakeTimers.restore();
      }
    }
  }).bind(this);

  this.Given('it is a weekday', function() {
    setupFakeTimers();

    var date = new Date();
    while(date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a weekend', function() {
    setupFakeTimers();

    var date = new Date();
    while(date.getDay() !== 0 && date.getDay() !== 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is not a holiday', function() {
    setupFakeTimers();

    var date = new Date();
    while(fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a holiday', function() {
    setupFakeTimers();

    var date = new Date();
    while(!fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });
}
