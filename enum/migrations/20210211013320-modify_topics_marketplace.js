'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Marketplaces", "topics", {
        type: Sequelize.ARRAY(Sequelize.STRING),
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropColumn("Marketplaces", "topics"),
    ]);
  }
};
