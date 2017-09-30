

const HeaderField = require('./HeaderField');

module.exports = class HeardFrom extends HeaderField {
  title() {
    return 'Heard from';
  }

  value() {
    return `${this.attachments.length} people`;
  }

  shortValue() {
    return true;
  }
};
