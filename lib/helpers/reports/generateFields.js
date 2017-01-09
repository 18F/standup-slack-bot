'use strict';

const _ = require('lodash');

function searchToday(attachments) {
  let stats = {
    ooo: [],
    pager: []
  };

  attachments.forEach((attachment) => {
    let today = attachment.fields.find((field) => {
      return field.title === 'Today';
    });

    if (today) {
      addTodaysStats(stats, today, attachment);
    }
  });

  return stats;
}

function addTodaysStats(stats, today, attachment) {
  let value = today.value.toLowerCase();

  if (value.match(/:pager:/)) {
    stats.pager.push(attachment.title);
  }

  if (value === 'ooo' || value === 'out of office') {
    stats.ooo.push(attachment.title);
  }
}

function formatValues(array) {
  var templates =  array.map((value) => {
    return '- ' + value + '\n';
  });

  return templates.join('');
}

function findChannels(attachments) {
  let stats = {};

  attachments.forEach((attachment) => {
    let channels = findAttachmentChannels(attachment);

    channels.forEach((channel) => {
      stats[channel] || (stats[channel] = 0);
      stats[channel] = stats[channel] + 1;
    });
  });

  return stats;
}

function findAndFilterChannels(attachments) {
  let channelStats = findChannels(attachments);
  let reducedStats =  _.pickBy(channelStats, function(value) {
    return value > 1;
  });
  return formatChannels(reducedStats);
}

function findAttachmentChannels(attachment) {
  let stringified = JSON.stringify(attachment);
  let matches = stringified.match(/<#\w+>/g);
  return _.uniq(matches || []);
}

function formatChannels(channels) {
  var collection = [];
  for (var channelName in channels) {
    collection.push(channelName + ' ('+ channels[channelName] +')');
  }
  return collection;
}

module.exports = function generateFields(attachments) {
  let sharedChannelStats  = findAndFilterChannels(attachments);
  let todaysStats         = searchToday(attachments);

  let fields = [{
    title: 'Heard from',
    value: attachments.length + ' people',
    short: true
  }];

  if (sharedChannelStats.length) {
    fields.push({
      title: 'Common projects',
      value: formatValues(sharedChannelStats),
      short: false
    });
  }
  if (todaysStats.pager.length) {
    fields.push({
      title: 'Available today :pager:',
      value: formatValues(todaysStats.pager),
      short: false
    });
  }
  if (todaysStats.ooo.length) {
    fields.push({
      title: 'Out today',
      value: formatValues(todaysStats.ooo),
      short: false
    });
  }

  return fields;
};

