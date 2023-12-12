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
      queryInterface.renameColumn("JobPosts", "title", "jobTitle"),
      queryInterface.renameColumn("JobPosts", "salary", "salaryRange"),
      queryInterface.removeColumn("JobPosts", "timezone"),
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
      queryInterface.renameColumn("JobPosts", "jobTitle", "title"),
      queryInterface.renameColumn("JobPosts", "salaryRange", "salary"),
      queryInterface.addColumn("JobPosts", "timezone", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
