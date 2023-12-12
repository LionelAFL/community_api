"use strict";
const db = require("../models");

const UserController = require("../controllers/UserController");

const User = db.User;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await UserController().importUsers(
      "two-years-membership.xlsx",
      new Date(2021, 0, 1),
      new Date(2022, 11, 31)
    );
    await UserController().importUsers(
      "one-year-membership.xlsx",
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
  },
};
