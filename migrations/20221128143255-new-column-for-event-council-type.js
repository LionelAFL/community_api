"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("CouncilEventPanels", "typePanel", {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("CouncilEventPanels", "typePanel"),
    ])
  },
};