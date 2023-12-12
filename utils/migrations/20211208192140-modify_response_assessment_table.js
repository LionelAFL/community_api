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
      queryInterface.addColumn("SkillCohortResourceResponses", "isDeleted", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("SkillCohortResponseAssessments", "isDeleted", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      queryInterface.removeColumn("SkillCohortResourceResponses", "isDeleted"),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "isDeleted"
      ),
    ]);
  },
};
