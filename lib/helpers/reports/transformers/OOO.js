'use strict';

const TodaySearcher = require('./TodaySearcher');

module.exports = class OOO extends TodaySearcher {
  title() {
    return 'Out today';
  }

  values() {
    let ooo = [];

    this.todays().forEach((object) => {
      let today = object.today;
      let attachment = object.attachment;
      let value = today.value.toLowerCase();

      if (value === 'ooo' || value === 'out of office') {
        ooo.push(attachment.title);
      }
    });

    return ooo;
  }
};
