"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Podcasts", "duration", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Podcasts", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
      queryInterface.addColumn("Libraries", "duration", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Libraries", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
      queryInterface.addColumn("ConferenceLibraries", "duration", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropColumn("Podcasts", "duration"),
      queryInterface.dropColumn("Podcasts", "viewed"),
      queryInterface.dropColumn("Libraries", "duration"),
      queryInterface.dropColumn("Libraries", "viewed"),
      queryInterface.dropColumn("ConferenceLibraries", "duration"),
    ]);
  },
};
