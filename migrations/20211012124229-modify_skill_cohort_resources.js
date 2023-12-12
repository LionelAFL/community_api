'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn(
      'SkillCohortResources',
      'title',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    )

    await queryInterface.addColumn(
      'SkillCohortResources',
      'description',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    )

    await queryInterface.addColumn(
      'SkillCohortResources',
      'level',
      {
        type: Sequelize.ENUM('basic', 'intermediate', 'advance'),
        allowNull: false
      }
    )

    await queryInterface.addColumn(
      'SkillCohortResources',
      'type',
      {
        type: Sequelize.ENUM('video', 'article', 'podcast'),
        allowNull: false
      }
    )

    await queryInterface.addColumn(
      'SkillCohortResources',
      'duration',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.removeColumn('SkillCohortResources', 'title'),
     await queryInterface.removeColumn('SkillCohortResources', 'level'),
     await queryInterface.removeColumn('SkillCohortResources', 'description'),
     await queryInterface.removeColumn('SkillCohortResources', 'skill'),
     await queryInterface.removeColumn('SkillCohortResources', 'type'),
     await queryInterface.removeColumn('SkillCohortResources', 'duration')
  }
};
