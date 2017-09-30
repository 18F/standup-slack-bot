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
        if (!stats[channel]) {
          stats[channel] = 0;
        }
        stats[channel] += 1;
      });
    });

    return stats;
  }

  findChannelsPerAttachment(record) {
    const stringified = JSON.stringify(record);
    const matches = stringified.match(/<#\w+>/g) || [];
    return matches.filter((element, index, array) => array.indexOf(element) === index);
  }

  formatChannelStats(stats) {
    const collection = [];
    for (const channelName of Object.keys(stats)) {
      collection.push(`${channelName} (${stats[channelName]})`);
    }
    return collection;
  }

  values() {
    const channelStats = this.buildChannelStats();
    Object.keys(channelStats).forEach((key) => {
      if (channelStats[key] <= 1) {
        delete channelStats[key];
      }
    });
    return this.formatChannelStats(channelStats);
  }
};
