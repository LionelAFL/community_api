"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.changeColumn("SkillCohortResources", "title", {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn("SkillCohortResources", "description", {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn("SkillCohortResources", "resourceLink", {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn("SkillCohortResources", "title", {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn("SkillCohortResources", "description", {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn("SkillCohortResources", "resourceLink", {
      type: Sequelize.STRING,
    });
  },
};
