"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("CouncilEvents", "relationEventAdmin", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: -1,
      }),
      queryInterface.addColumn("CouncilEventPanels", "arrayControlIdsEvents", {
        type: Sequelize.ARRAY(Sequelize.JSON),
        defaultValue: [],
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("CouncilEvents", "relationEventAdmin"),
      queryInterface.removeColumn("CouncilEventPanels", "arrayControlIdsEvents"),
    ])
  },
};