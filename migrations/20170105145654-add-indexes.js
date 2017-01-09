'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addIndex(
      'Channels',
      ['name'],
      {
        indicesType: 'UNIQUE'
      }
    ).then(() => {
      return queryInterface.addIndex(
        'Standups',
        ['channel', 'date', 'user'],
        {
          indicesType: 'UNIQUE'
        }
      )
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
