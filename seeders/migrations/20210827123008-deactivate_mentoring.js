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
      queryInterface.addColumn("Mentorings", "blockMatchAsMentor", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
      queryInterface.addColumn("Mentorings", "blockMatchAsMentee", {
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
