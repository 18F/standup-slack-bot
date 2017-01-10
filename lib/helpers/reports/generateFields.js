'use strict';

const _ = require('lodash');

class HeaderField {
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
}

class HeardFrom extends HeaderField {
  title() {
    return 'Heard from';
  }

  value() {
    return this.attachments.length + ' people';
  }

  shortValue() {
    return true;
  }
}

class SharedChannels extends HeaderField {
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
}

class TodaySearcher extends HeaderField {
  todays() {
    let todays = this.attachments.map((attachment) => {
      var found = attachment.fields.find((field) => {
        return field.title === 'Today';
      });

      if (found) {
        return {attachment: attachment, today: found};
      }
    });

    return _.compact(todays);
  }
}

class Pager extends TodaySearcher {
  title() {
    return 'Available today :pager:';
  }

  values() {
    let pagers = [];

    this.todays().forEach((object) => {
      let today = object.today;
      let attachment = object.attachment;
      let value = today.value.toLowerCase();
      if (value.match(/:pager:/)) {
        pagers.push(attachment.title);
      }
    });

    return pagers;
  }
}

class OOO extends TodaySearcher {
  title() {
    return 'Out today';
  }

  values() {
    let ooo = [];

    this.todays().forEach((object) => {
      let today = object.today;
      let attachment = object.attachment;
      let value = today.value.toLowerCase();

      if (value === 'ooo' || value === 'out of office') {
        ooo.push(attachment.title);
      }
    });

    return ooo;
  }
}

module.exports = function generateFields(attachments) {
  let fields = [
    HeardFrom,
    SharedChannels,
    Pager,
    OOO
  ].map((Klass) => {
    return new Klass(attachments).field();
  });

  return _.compact(fields);
};

