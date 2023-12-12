"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Libraries", "orderLibraries", {
        allowNull: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Libraries", "orderLibraries"),
    ])
  },
};