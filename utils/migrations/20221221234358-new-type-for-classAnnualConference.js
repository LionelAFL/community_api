"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("SpeakerPanelsClass", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        AnnualConferenceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        videoUrl: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        duration: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        topics: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: false,
        },
        documentFileName: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        documentFileUrl: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        audioFileName: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        audioFileUrl: {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("SpeakerPanelsClass"),
    ])
  },
};