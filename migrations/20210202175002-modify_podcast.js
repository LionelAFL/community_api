'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Podcasts", "topics", {
        type: Sequelize.ARRAY(Sequelize.STRING),
      }),
      queryInterface.addColumn("Podcasts", "contentType", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropColumn("Podcasts", "topics"),
      queryInterface.dropColumn("Podcasts", "contentType"),
    ]);
  }
};
