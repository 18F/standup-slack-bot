'use strict';

module.exports = function generateFields(attachments) {
  // Create summary statistics
  var fields = [];

  // Find common channels
  var regex = /<#\w+>/g;
  var search;
  var results = {};
  var commonChannels = '';
  while ((search = regex.exec(JSON.stringify(attachments))) !== null) {
    if (results[search[0]]) {
      results[search[0]] += 1;
    } else {
      results[search[0]] = 1;
    }
  }
  for (var i in results) {
    if (results[i] > 1) {
      // common[i] = results[i];
      commonChannels += '- ' + i + ' ('+results[i]+')\n';
    }
  }

  // Find people who used :pager: to indicate availability
  // Find people who are out of office (OOO) today
  var pager = '';
  var ooo = '';
  for (let attachment of attachments) {
    for (let field of attachment.fields) {
      if (field.title === 'Today') {
        if (field.value.search(/:pager:/) >= 0) {
          pager += '- '+attachment.title + '\n';
        }
        if (field.value.toLowerCase() === 'ooo' || field.value.toLowerCase() === 'out of office') {
          ooo += '- '+attachment.title + '\n';
        }
      }
    }
  }

  // Find total number of standups
  var length = attachments.length;

  // Assemble stats
  fields.push({
    title: 'Heard from',
    value: length + ' people',
    short: true
  });
  if (commonChannels.length >= 1) {
    fields.push({
      title: 'Common projects',
      value: commonChannels,
      short: false
    });
  }
  if (pager.length >= 1) {
    fields.push({
      title: 'Available today :pager:',
      value: pager,
      short: false
    });
  }
  if (ooo.length >= 1) {
    fields.push({
      title: 'Out today',
      value: ooo,
      short: false
    });
  }

  return fields;
};

