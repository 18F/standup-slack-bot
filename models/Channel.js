'use strict';

module.exports = function (sequelize, DataTypes) {
  var Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING
    },
    day: {
      type: DataTypes.STRING
    },
    time: {
      // military time
      type: DataTypes.INTEGER
    }
  });

  return Channel;
};
