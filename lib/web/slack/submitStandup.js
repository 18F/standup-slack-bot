const log = require('../../../getLogger')('slack web | start standup interview');
const botHelpers = require('../../helpers');

module.exports = function submitStandup(bot, channelID, userID) {
  log.verbose(`User ${userID} clicked the "start interview" button in channel ${channelID}`);
  botHelpers.doInterview(bot, channelID, userID);
};
