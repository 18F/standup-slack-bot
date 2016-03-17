'use strict';

var log = require('../getLogger')('Channel model');

module.exports = function (sequelize, DataTypes) {
  log.verbose('Initializing');

  var Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING
    },
    time: {
      // military time
      type: DataTypes.INTEGER
    }
  });

  return Channel;
};
