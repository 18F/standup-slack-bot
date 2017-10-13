'use strict';

const convertStandups = require('./convertStandups');
const generateFields  = require('./generateFields');

function defaultMessage(channelName) {
  return `Today's standup for <#${channelName}>`;
}

module.exports = function(channel, standups) {
  let channelName = channel.name;
  let attachments = convertStandups(standups);

  attachments.unshift({
    fallback: defaultMessage(channelName),
    pretext:  defaultMessage(channelName),
    title:    'Summary',
    fields:   generateFields(attachments)
  });

  return {
    channel: channelName,
    attachments: attachments
  };
};

