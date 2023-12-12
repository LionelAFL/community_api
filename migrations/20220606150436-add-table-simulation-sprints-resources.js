"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SimulationSprintResources", {
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM("basic", "intermediate", "advance"),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("video", "article", "podcast"),
        allowNull: false,
      },
      resourceLink: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      releaseDate: {
        allowNull: false,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("SimulationSprintResources");
  },
};
