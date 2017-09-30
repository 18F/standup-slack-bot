

const _ = require('lodash');
const HeaderField = require('./HeaderField');

// This probably would be better as a function that receives attachments
module.exports = class TodaySearcher extends HeaderField {
  todays() {
    const todays = this.attachments.map((attachment) => {
      const found = attachment.fields.find(field => field.title === 'Today');

      if (found) {
        return { attachment, today: found };
      }
    });

    return _.compact(todays);
  }
};
