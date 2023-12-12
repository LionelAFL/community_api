"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await Promise.all([
      queryInterface.addColumn("SkillCohorts", "howProjectXWorks", {
        type: Sequelize.JSON,
        defaultValues: {},
      }),
      queryInterface.changeColumn("SkillCohorts", "description", {
        type: 'JSON USING CAST("description" as JSON)',
        defaultValues: {},
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
      queryInterface.removeColumn("SkillCohorts", "howProjectXWorks"),
      queryInterface.changeColumn("SkillCohorts", "description", {
        type: Sequelize.TEXT,
      }),
    ]);
  },
};
