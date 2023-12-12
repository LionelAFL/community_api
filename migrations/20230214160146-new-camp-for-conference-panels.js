"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("SpeakerPanels", "status", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'active',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("SpeakerPanels", "status"),
    ])
  },
};