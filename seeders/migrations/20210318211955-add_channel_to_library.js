"use strict";

const { Settings } = require("../enum");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn("Libraries", "level", {
        type: Sequelize.INTEGER,
        values: [VisibleLevel.DEFAULT, VisibleLevel.CHANNEL, VisibleLevel.ALL],
        defaultValue: VisibleLevel.DEFAULT,
      }),
      queryInterface.addColumn("Libraries", "channel", {
        type: Sequelize.INTEGER,
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
  },
};
