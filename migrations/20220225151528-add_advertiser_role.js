"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.addColumn("Users", "isAdvertiser", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("Users", "advertiserSubscriptionDate", {
        type: Sequelize.DATE,
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
    await Promise.all([
      queryInterface.addColumn("Users", "isAdvertiser"),
      queryInterface.addColumn("Users", "advertiserSubscriptionDate"),
    ]);
  },
};
