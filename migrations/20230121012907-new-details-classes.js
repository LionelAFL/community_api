"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("AnnualConferenceClassUsers", "type", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "2022",
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("AnnualConferenceClassUsers", "type"),
    ])
  },
};