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
      queryInterface.addColumn("Users", "recentJobLevel", {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
      queryInterface.addColumn("Users", "recentWorkArea", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      }),
      queryInterface.addColumn("Users", "sizeOfOrganization", {
        type: Sequelize.STRING,
        defaultValue: null,
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
  }
};
