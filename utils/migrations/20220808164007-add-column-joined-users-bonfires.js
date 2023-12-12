"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.removeColumn("Bonfires", "uninvitedJoinedUsers", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn("Bonfires", "joinedUsers", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
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

    await queryInterface.addColumn("Bonfires", "uninvitedJoinedUsers", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.removeColumn("Bonfires", "joinedUsers", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    });
  },
};
