"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "showPopupMyLearning", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "showPopupMyLearning"),
    ])
  },
};