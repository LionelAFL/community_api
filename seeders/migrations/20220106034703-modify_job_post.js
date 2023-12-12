"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.renameColumn(
      "JobPosts",
      "preferredSkills",
      "mainJobFunctions"
    );
    await queryInterface.addColumn("JobPosts", "preferredSkills", {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.renameColumn(
      "JobPosts",
      "mainJobFunctions",
      "preferredSkills"
    );
    await queryInterface.removeColumn("JobPosts", "preferredSkills");
  },
};
