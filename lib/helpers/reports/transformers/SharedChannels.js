

const _ = require('lodash');
const HeaderField = require('./HeaderField');

module.exports = class SharedChannels extends HeaderField {
  title() {
    return 'Common projects';
  }

  buildChannelStats() {
    const stats = {};

    this.attachments.forEach((attachment) => {
      const channels = this.findChannelsPerAttachment(attachment);

      channels.forEach((channel) => {
        stats[channel] || (stats[channel] = 0);
        stats[channel] = stats[channel] + 1;
      });
    });

    return stats;
  }

  findChannelsPerAttachment(record) {
    const stringified = JSON.stringify(record);
    const matches = stringified.match(/<#\w+>/g);
    return _.uniq(matches || []);
  }

  formatChannelStats(stats) {
    const collection = [];
    for (const channelName in stats) {
      collection.push(`${channelName} (${stats[channelName]})`);
    }
    return collection;
  }

  values() {
    const channelStats = this.buildChannelStats();
    const reduced = _.pickBy(channelStats, value => value > 1);
    return this.formatChannelStats(reduced);
  }
};
