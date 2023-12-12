'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn("Events", "startDate", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Events", "startTime", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Events", "endDate", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Events", "endTime", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
