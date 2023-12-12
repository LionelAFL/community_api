"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Users", "simulationSprintsAvailable", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn(
      "Users",
      "simulationSprintsSubscriptionStartDate",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.removeColumn("Users", "simulationSprintsAvailable", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.removeColumn(
      "Users",
      "simulationSprintsSubscriptionStartDate",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );
  },
};
