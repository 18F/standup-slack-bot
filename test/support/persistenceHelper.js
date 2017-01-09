'use strict';

require('dotenv').config();
const models          = require('../../models');
const timeHelper      = require('../../lib/helpers/time');

function deleteAll() {
  return models.Channel
    .destroy({where: {}})
    .then(() => {
      return models.Standup.destroy({where: {}});
    });
}

function createRecords(channelName, state) {
  return models.Channel
    .create({
      name: channelName,
      latestReport: 'something-with.hello?'
    })
    .then((record) => {
      state.channel = record;
    })
    .then(() => {
      return models.Standup
        .create({
          channel: channelName,
          date: timeHelper.getCurrentDate()
        });
    })
    .then((record) => {
      state.standup = record;
    });
}

function setupTest(channelName, state) {
  return deleteAll().then(() => { return createRecords(channelName, state); });
}

module.exports = {
  deleteAll: deleteAll,
  createRecords: createRecords,
  setupTest: setupTest
};
