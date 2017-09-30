module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable(
      'Channels',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        },
        name: {
          type: Sequelize.STRING
        },
        time: {
          type: Sequelize.INTEGER,
          defaultValue: null
        },
        reminderMinutes: {
          type: Sequelize.INTEGER,
          defaultValue: null
        },
        reminderTime: {
          type: Sequelize.INTEGER,
          defaultValue: null
        },
        latestReport: {
          type: Sequelize.STRING,
          defaultValue: null
        }
      }
    ).then(() => queryInterface.createTable(
      'Standups',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        },
        channel: {
          type: Sequelize.STRING
        },
        date: {
          type: Sequelize.DATEONLY
        },
        user: {
          type: Sequelize.STRING
        },
        userRealName: {
          type: Sequelize.STRING
        },
        thumbUrl: {
          type: Sequelize.STRING
        },
        yesterday: {
          type: Sequelize.STRING(1000)
        },
        today: {
          type: Sequelize.STRING(1000)
        },
        blockers: {
          type: Sequelize.STRING(1000)
        },
        goal: {
          type: Sequelize.STRING(1000)
        }
      }
    ));
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
