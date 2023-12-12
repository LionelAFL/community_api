"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CouncilEventPanels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      CouncilEventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "CouncilEvents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      panelName: {
        type: Sequelize.STRING,
      },
      panelStartAndEndDate: {
        type: Sequelize.ARRAY(Sequelize.DATE),
      },
      numberOfPanelists: {
        type: Sequelize.INTEGER,
      },
      linkToJoin: {
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
    await queryInterface.dropTable("CouncilEventPanels");
  },
};
