const convertStandups = require('./convertStandups');
const generateFields = require('./generateFields');

function defaultMessage(channelName) {
  return `Todays standup for <#${channelName}>`;
}

module.exports = (channel, standups) => {
  const channelName = channel.name;
  const attachments = convertStandups(standups);

  attachments.unshift({
    fallback: defaultMessage(channelName),
    pretext: defaultMessage(channelName),
    title: 'Summary',
    fields: generateFields(attachments)
  });

  return {
    channel: channelName,
    attachments
  };
};
