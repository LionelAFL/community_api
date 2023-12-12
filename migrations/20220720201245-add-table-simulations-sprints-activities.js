"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SimulationSprintActivites", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      SimulationSprintId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "SimulationSprints",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM("Mandatory", "Recommended"),
        defaultValue: "Recommended",
      },
      deliveryDate: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("SimulationSprintActivites");
  },
};
