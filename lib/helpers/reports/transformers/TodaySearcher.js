const HeaderField = require('./HeaderField');

// This probably would be better as a function that receives attachments
module.exports = class TodaySearcher extends HeaderField {
  todays() {
    return this.attachments.map((attachment) => {
      const found = attachment.fields.find(field => field.title === 'Today');

      if (found) {
        return { attachment, today: found };
      }
      return false;
    }).filter(value => value !== false);
  }
};
