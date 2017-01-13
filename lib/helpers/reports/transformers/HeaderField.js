'use strict';

module.exports = class HeaderField {
  constructor(attachments) {
    this.attachments = attachments;
  }

  shortValue() {
    return false;
  }

  formatValues() {
    var templates =  this.values().map((value) => {
      return '- ' + value + '\n';
    });
    return templates.join('');
  }

  value() {
    let values = this.values();
    if (!values || !values.length) { return; }
    return this.formatValues();
  }

  field() {
    if (!this.value()) { return; }

    return {
      title: this.title(),
      value: this.value(),
      short: this.shortValue()
    };
  }
};
