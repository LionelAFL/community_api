"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("CouncilEventPanels", "descriptionPanel", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("CouncilEventPanels", "hrCreditsBoolean", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("CouncilEventPanels", "typeHrCredits", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("CouncilEventPanels", "descriptionPanel"),
      queryInterface.removeColumn("CouncilEventPanels", "hrCreditsBoolean"),
      queryInterface.removeColumn("CouncilEventPanels", "typeHrCredits"),
    ])
  },
};