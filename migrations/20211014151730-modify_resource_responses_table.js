'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.removeColumn('SkillCohortResourceResponses', 'numberOfLikes')
     await queryInterface.removeColumn('SkillCohortResourceResponses', 'numberOfDislikes')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

     await queryInterface.addColumn(
      'SkillCohortResourceResponses',
      'numberOfLikes',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    )

     await queryInterface.addColumn(
      'SkillCohortResourceResponses',
      'numberOfDislikes',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    )
  }
};
