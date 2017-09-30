const moment = require('moment');
const models = require('../models');
const appEnv = require('cfenv').getAppEnv();

if (appEnv.getServices() && Object.keys(appEnv.getServices()).length) {
  // If running on Cloud Foundry
  process.env.TIMEZONE = appEnv.getServiceCreds('standup-bot-cups').TIMEZONE;
}
const TIMEZONE = process.env.TIMEZONE || 'America/New_York';

module.exports = {
  up() {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return new Promise((resolve) => {
      const updates = [];

      models.Channel.findAll().then((channels) => {
        for (const channel of channels) {
          let time = String(channel.time);
          while (time.length < 4) {
            time = `0${time}`;
          }
          time = moment.utc(time, 'HHmm');

          // Display in the standard timezone
          const newTime = (moment.tz(time, TIMEZONE).format('Hmm')) / 1.0;
          let reminderTime = newTime - channel.reminderMinutes;
          if (reminderTime < 0) {
            reminderTime += 2400;
          }

          updates.push(models.Channel.update({ time: newTime, reminderTime }, { where: { name: channel.name } }));
        }

        Promise.all(updates).then(resolve);
      });
    });
  },

  down() {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
