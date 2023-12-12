"use strict";

const db = require("../models");
const { progressLog } = require("../utils/excel");

const User = db.User;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const users = await User.findAll();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await User.update(
        {
          email: user.email.toLowerCase(),
        },
        {
          where: { id: user.id },
        }
      );
      progressLog(`${i + 1} / ${users.length} updated.`);
    }
    return true;
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
