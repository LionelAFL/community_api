'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.removeColumn("Events", 'startTime'),
      queryInterface.removeColumn("Events", 'endTime'),
      queryInterface.addColumn("Events", "startAndEndTimes", {
        type: Sequelize.ARRAY(Sequelize.JSON),
        allowNull: false,
        defaultValue: []
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await Promise.all([
      queryInterface.addColumn("Events", "startTime", {
        type: Sequelize.DATE,
        allowNull: true
      }),
      await queryInterface.addColumn("Events", "endTime", {
        type: Sequelize.DATE,
        allowNull: true
      }),
      await queryInterface.removeColumn("Events", 'startAndEndTimes')
    ])
  }
};
