module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn(
      'Channels',
      'monday',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    ).then(() => queryInterface.addColumn(
      'Channels',
      'tuesday',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    )).then(() => queryInterface.addColumn(
      'Channels',
      'wednesday',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    )).then(() => queryInterface.addColumn(
      'Channels',
      'thursday',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    ))
      .then(() => queryInterface.addColumn(
        'Channels',
        'friday',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true
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
