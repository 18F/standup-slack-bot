const TodaySearcher = require('./TodaySearcher');

module.exports = class Pager extends TodaySearcher {
  title() {
    return 'Available today :pager:';
  }

  values() {
    const pagers = [];

    this.todays().forEach((object) => {
      const { today, attachment } = object;
      const value = today.value.toLowerCase();
      if (value.match(/:pager:/)) {
        pagers.push(attachment.title);
      }
    });

    return pagers;
  }
};
