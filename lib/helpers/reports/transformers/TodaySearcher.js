'use strict';

const _           = require('lodash');
const HeaderField = require('./HeaderField');

// This probably would be better as a function that receives attachments
module.exports = class TodaySearcher extends HeaderField {
  todays() {
    let todays = this.attachments.map((attachment) => {
      var found = attachment.fields.find((field) => {
        return field.title === 'Today';
      });

      if (found) {
        return {attachment: attachment, today: found};
      }
    });

    return _.compact(todays);
  }
};
