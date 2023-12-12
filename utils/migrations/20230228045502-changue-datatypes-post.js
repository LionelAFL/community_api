"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Posts", "imageUrl", {
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Posts", "imageUrl"),
    ]);
  },
};
