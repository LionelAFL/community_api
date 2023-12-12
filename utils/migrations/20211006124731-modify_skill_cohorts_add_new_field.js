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
      queryInterface.addColumn(
        'SkillCohorts',
        'categories',
        {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: [],
        }
      )
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users'); 
     * categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      }
     */
    return Promise.all([
      queryInterface.removeColumn('SkillCohorts', 'categories')
    ])
  }
};
