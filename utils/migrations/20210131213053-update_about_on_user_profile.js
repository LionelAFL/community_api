"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.changeColumn("Users", "about", {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn("Libraries", "description", {
        type: Sequelize.TEXT,
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
    return Promise.all([
      queryInterface.changeColumn("Users", "about"),
      queryInterface.changeColumn("Libraries", "description"),
    ]);
  },
};
