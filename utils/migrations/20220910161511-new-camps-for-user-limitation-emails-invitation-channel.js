"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Users", "dateRenewInvitationEmail", {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.addColumn(
      "Users",
      "countEmailsSend",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Users", "dateRenewInvitationEmail");

    await queryInterface.removeColumn("Users", "countEmailsSend");
  },
};
