"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "statusEvent", {
        type: Sequelize.TEXT,
        defaultValue: 'active',
        allowNull: true,
      }),
      queryInterface.addColumn("Events", "firstTime", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      }),
      queryInterface.addColumn("SpeakerPanels", "descriptionPanel", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("SpeakerPanels", "hrCreditsBoolean", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("SpeakerPanels", "typeHrCredits", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("SpeakerPanels", "numberOfHRCredits", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      }),
      queryInterface.addColumn("CouncilEventPanels", "numberOfHRCredits", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "status"),
      queryInterface.removeColumn("Events", "firstTime"),
      queryInterface.removeColumn("SpeakerPanels", "descriptionPanel"),
      queryInterface.removeColumn("SpeakerPanels", "hrCreditsBoolean"),
      queryInterface.removeColumn("SpeakerPanels", "typeHrCredits"),
      queryInterface.removeColumn("SpeakerPanels", "numberOfHRCredits"),
      queryInterface.removeColumn("CouncilEventPanels", "numberOfHRCredits"),
    ])
  },
};