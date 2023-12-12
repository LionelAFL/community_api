"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "bulCodeEvent", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Events", "codeVerifyEvent", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "bulCodeEvent"),
      queryInterface.removeColumn("Events", "codeVerifyEvent"),
    ])
  },
};