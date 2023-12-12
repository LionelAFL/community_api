'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('Events', 'ticket', {
      type: Sequelize.STRING,
      defaultValue: "free",
      values: ["free", "premium"]
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.changeColumn('Events', 'ticket', {
      type: Sequelize.STRING,
      defaultValue: "free",
      values: ["free", "priced"]
    })
  }
};
