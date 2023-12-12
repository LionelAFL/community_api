'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.changeColumn("CouncilEventPanels", "startDate", {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn("CouncilEventPanels", "endDate", {
        type: Sequelize.TEXT,
      }),
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("CouncilEventPanels", "startDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn("CouncilEventPanels", "endDate", {
        type: Sequelize.DATE,
      }),
    ]);
  }
};
