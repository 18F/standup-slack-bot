

const TodaySearcher = require('./TodaySearcher');

module.exports = class OOO extends TodaySearcher {
  title() {
    return 'Out today';
  }

  values() {
    const ooo = [];

    this.todays().forEach((object) => {
      const today = object.today;
      const attachment = object.attachment;
      const value = today.value.toLowerCase();

      if (value === 'ooo' || value === 'out of office') {
        ooo.push(attachment.title);
      }
    });

    return ooo;
  }
};
