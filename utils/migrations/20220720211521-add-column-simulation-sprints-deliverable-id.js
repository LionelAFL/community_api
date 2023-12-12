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
      "SimulationSprintResources",
      "SimulationSprintDeliverableId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SimulationSprintDeliverables",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.removeColumn(
      "SimulationSprintResources",
      "SimulationSprintDeliverableId"
    );
  },
};
