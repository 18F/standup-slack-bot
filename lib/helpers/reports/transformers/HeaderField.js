module.exports = class HeaderField {
  constructor(attachments) {
    this.attachments = attachments;
  }

  shortValue() {
    return false;
  }

  formatValues() {
    const templates = this.values().map(value => `- ${value}\n`);
    return templates.join('');
  }

  value() {
    const values = this.values();
    if (!values || !values.length) {
      return null;
    }
    return this.formatValues();
  }

  field() {
    if (!this.value()) {
      return null;
    }

    return {
      title: this.title(),
      value: this.value(),
      short: this.shortValue()
    };
  }
};
