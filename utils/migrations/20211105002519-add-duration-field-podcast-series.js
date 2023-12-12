"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("PodcastSeries", "durationLearningBadges", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropColumn("PodcastSeries", "durationLearningBadges"),
    ]);
  },
};
