"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CouncilEvents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      eventName: {
        type: Sequelize.STRING,
      },
      startDate: Sequelize.DATE,
      endDate: Sequelize.DATE,
      description: Sequelize.TEXT,
      numberOfPanels: Sequelize.INTEGER,
      panels: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        defaultValue: [],
      },
      status: Sequelize.ENUM("draft", "active"),
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
    await queryInterface.dropTable("CouncilEvents");
  },
};
