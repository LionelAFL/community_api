"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("SpeakerPanelStatus", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        idUser: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        idSession: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        viewed: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        saveForLater: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("SpeakerPanelStatus"),
    ])
  },
};