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
      'SkillCohortGroupings',
      'meetingLink',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    )

    await queryInterface.addColumn(
      'SkillCohortGroupings',
      'meetingDateTime',
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    )

    await queryInterface.removeColumn('SkillCohorts', 'currentWeekNumber')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.removeColumn('SkillCohortGroupings', 'meetingLink')
     await queryInterface.removeColumn('SkillCohortGroupings', 'meetingDateTime')

     await queryInterface.addColumn(
      'SkillCohorts',
      'currentWeekNumber',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    )
  }
};
