'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("SpeakerPanels", "metaData", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("SpeakerPanels", "recertificactionCredits", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("SpeakerPanels", "link", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("SpeakerPanels", "objetives", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("SpeakerPanels", "category", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      }),
      queryInterface.addColumn("SpeakerPanels", "type", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("SpeakerPanels", "metaData"),
      queryInterface.removeColumn("SpeakerPanels", "recertificactionCredits"),
      queryInterface.removeColumn("SpeakerPanels", "link"),
      queryInterface.removeColumn("SpeakerPanels", "objetives"),
      queryInterface.removeColumn("SpeakerPanels", "category"),
      queryInterface.removeColumn("SpeakerPanels", "type"),
    ])
  }
};
