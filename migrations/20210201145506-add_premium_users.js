'use strict';
const UserController = require("../controllers/UserController");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await UserController().importUsers(
      "one-year-membership 2021.2.1.xlsx",
      new Date(2021, 0, 1),
      new Date(2021, 11, 31)
    );
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
