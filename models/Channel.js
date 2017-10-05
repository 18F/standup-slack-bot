const log = require('../getLogger')('Channel model');

module.exports = (sequelize, DataTypes) => {
  log.verbose('Initializing');

  const Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING
    },
    time: {
      // military time
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    reminderMinutes: {
      // in minutes
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    reminderTime: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    latestReport: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    audience: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    monday: {
      type: DataTypes.BOOLEAN
    },
    tuesday: {
      type: DataTypes.BOOLEAN
    },
    wednesday: {
      type: DataTypes.BOOLEAN
    },
    thursday: {
      type: DataTypes.BOOLEAN
    },
    friday: {
      type: DataTypes.BOOLEAN
    },
    postUpdatesInChannel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return Channel;
};
