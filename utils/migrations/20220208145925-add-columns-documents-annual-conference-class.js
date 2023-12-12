"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      "AnnualConferenceClasses",
      "documentFileName",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      "AnnualConferenceClasses",
      "documentFileUrl",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
    await queryInterface.addColumn("AnnualConferenceClasses", "audioFileName", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("AnnualConferenceClasses", "audioFileUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "AnnualConferenceClasses",
      "documentFileName"
    );
    await queryInterface.removeColumn(
      "AnnualConferenceClasses",
      "documentFileUrl"
    );
    await queryInterface.removeColumn(
      "AnnualConferenceClasses",
      "audioFileName"
    );
    await queryInterface.removeColumn(
      "AnnualConferenceClasses",
      "audioFileUrl"
    );
  },
};
