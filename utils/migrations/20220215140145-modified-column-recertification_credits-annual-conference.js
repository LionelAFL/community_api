"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn(
      "AnnualConferences",
      "recertification_credits",
      {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn(
      "AnnualConferences",
      "recertification_credits",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
};
