"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("SpeakerPanelClassUser", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      viewed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      progressVideo: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      AnnualConferenceClassId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("SpeakerPanelClassUser");
  },
};
