"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return await Promise.all([
      queryInterface.addColumn("Libraries", "saveForLater", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.addColumn("ConferenceLibraries", "saveForLater", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.addColumn("Podcasts", "saveForLater", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.addColumn("PodcastSeries", "saveForLater", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.changeColumn("Libraries", "viewed", {
        type: Sequelize.JSONB,
        defaultValue: {},
      }),
      queryInterface.changeColumn("ConferenceLibraries", "viewed", {
        type: Sequelize.JSONB,
        defaultValue: {},
      }),
      queryInterface.changeColumn("Podcasts", "viewed", {
        type: Sequelize.JSONB,
        defaultValue: {},
      }),
      queryInterface.changeColumn("PodcastSeries", "viewed", {
        type: Sequelize.JSONB,
        defaultValue: {},
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    return await Promise.all([
      queryInterface.removeColumn("Libraries", "saveForLater"),
      queryInterface.removeColumn("ConferenceLibraries", "saveForLater"),
      queryInterface.removeColumn("Podcasts", "saveForLater"),
      queryInterface.removeColumn("PodcastSeries", "saveForLater"),
      queryInterface.changeColumn("Libraries", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
      queryInterface.changeColumn("ConferenceLibraries", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
      queryInterface.changeColumn("Podcasts", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
      queryInterface.changeColumn("PodcastSeries", "viewed", {
        type: Sequelize.JSON,
        defaultValue: {},
      }),
    ]);
  },
};
