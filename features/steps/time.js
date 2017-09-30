const sinon = require('sinon');
const fedHolidays = require('@18f/us-federal-holidays');

let fakeTimers = null;

module.exports = function mockTimeSetup() {
  // Fake timers with sinon if they haven't been
  // setup already.  Set the internal time to now.
  // (Sinon defaults to the epoch).
  const setupFakeTimers = () => {
    if (!fakeTimers) {
      fakeTimers = sinon.useFakeTimers(Date.now());
    }
  };

  this.Given('it is a weekday', () => {
    setupFakeTimers();

    // Go backwards one day at a time until we land
    // on a day that is neither Sunday (0) or
    // Saturday (6).  Go backwards because if we
    // go forward, you will trigger cucumber's
    // test timeout logic.
    let date = new Date();
    while (date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a weekend', () => {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on Saturday or Sunday.
    let date = new Date();
    while (date.getDay() !== 0 && date.getDay() !== 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is not a holiday', () => {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on a weekday that isn't a holiday.
    let date = new Date();
    while (fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  this.Given('it is a holiday', () => {
    setupFakeTimers();

    // Go backwards a day at a time until we land
    // on a weekday that is a holiday.
    let date = new Date();
    while (!fedHolidays.isAHoliday() || date.getDay() === 0 || date.getDay() === 6) {
      fakeTimers.tick(-86400000);
      date = new Date();
    }
  });

  // Reset fake timers
  this.After = () => {
    if (fakeTimers) {
      fakeTimers.restore();
    }
  };
};

// Provide a mechanism for manually resetting the
// timers if needed.
module.exports.resetTimers = () => {
  if (fakeTimers) {
    fakeTimers.restore();
    fakeTimers = null;
  }
};
