"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn(
      "SkillCohortParticipants",
      "numberOfAssessmentStrike"
    );
    await queryInterface.removeColumn(
      "SkillCohortParticipants",
      "numberOfCommentStrike"
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn(
      "SkillCohortParticipants",
      "numberOfAssessmentStrike",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.addColumn(
      "SkillCohortParticipants",
      "numberOfCommentStrike",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );
  },
};
