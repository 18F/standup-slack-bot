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
