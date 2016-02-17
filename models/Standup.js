'use strict';

module.exports = function (sequelize, DataTypes) {
    var Standup = sequelize.define('Standup', {
        channel: {
          type: DataTypes.STRING
        },
        date: {
            type: DataTypes.DATEONLY
        },
        user: {
            type: DataTypes.STRING
        },
        yesterday: {
            type: DataTypes.STRING
        },
        today: {
            type: DataTypes.STRING
        },
        blockers: {
            type: DataTypes.STRING
        },
        goal: {
            type: DataTypes.STRING
        }
    });

    return Standup;
};
