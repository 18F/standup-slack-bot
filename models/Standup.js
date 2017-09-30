const log = require('../getLogger')('Standup model');

module.exports = (sequelize, DataTypes) => {
  log.verbose('Initializing');
  const Standup = sequelize.define('Standup', {
    channel: {
      type: DataTypes.STRING
    },
    date: {
      type: DataTypes.DATEONLY
    },
    user: {
      type: DataTypes.STRING
    },
    userRealName: {
      type: DataTypes.STRING
    },
    thumbUrl: {
      type: DataTypes.STRING
    },
    yesterday: {
      type: DataTypes.STRING(1000)
    },
    today: {
      type: DataTypes.STRING(1000)
    },
    blockers: {
      type: DataTypes.STRING(1000)
    },
    goal: {
      type: DataTypes.STRING(1000)
    }
  });

  return Standup;
};
