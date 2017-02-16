'use strict';

const _           = require('lodash');
const HeaderField = require('./HeaderField');

module.exports = class SharedChannels extends HeaderField {
  title() {
    return 'Common projects';
  }

  buildChannelStats() {
    let stats = {};

    this.attachments.forEach((attachment) => {
      let channels = this.findChannelsPerAttachment(attachment);

      channels.forEach((channel) => {
        stats[channel] || (stats[channel] = 0);
        stats[channel] = stats[channel] + 1;
      });
    });

    return stats;
  }

  findChannelsPerAttachment(record) {
    let stringified = JSON.stringify(record);
    let matches = stringified.match(/<#\w+>/g);
    return _.uniq(matches || []);
  }

  formatChannelStats(stats) {
    var collection = [];
    for (var channelName in stats) {
      collection.push(channelName + ' ('+ stats[channelName] +')');
    }
    return collection;
  }

  values() {
    let channelStats = this.buildChannelStats();
    let reduced = _.pickBy(channelStats, function(value) {
      return value > 1;
    });
    return this.formatChannelStats(reduced);
  }
};
