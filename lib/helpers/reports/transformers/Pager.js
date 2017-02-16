'use strict';

const TodaySearcher = require('./TodaySearcher');

module.exports = class Pager extends TodaySearcher {
  title() {
    return 'Available today :pager:';
  }

  values() {
    let pagers = [];

    this.todays().forEach((object) => {
      let today = object.today;
      let attachment = object.attachment;
      let value = today.value.toLowerCase();
      if (value.match(/:pager:/)) {
        pagers.push(attachment.title);
      }
    });

    return pagers;
  }
};
