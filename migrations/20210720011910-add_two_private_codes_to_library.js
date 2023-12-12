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
      queryInterface.addColumn("Libraries", "shrmCode", {
        type: Sequelize.STRING,
        defaultValue: "",
      }),
      queryInterface.addColumn("Libraries", "hrciCode", {
        type: Sequelize.STRING,
        defaultValue: "",
      }),
      queryInterface.addColumn("Libraries", "showClaim", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
