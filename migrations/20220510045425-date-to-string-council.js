'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.changeColumn("CouncilEvents", "startDate", {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn("CouncilEvents", "endDate", {
        type: Sequelize.TEXT,
      }),
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("CouncilEvents", "startDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn("CouncilEvents", "endDate", {
        type: Sequelize.DATE,
      }),
    ]);
  }
};
