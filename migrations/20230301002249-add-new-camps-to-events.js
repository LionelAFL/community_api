"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "addMessagueAttendEmail", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "",
      }),
      queryInterface.addColumn("Events", "messagueEmail", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "",
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "addMessagueAttendEmail"),
      queryInterface.removeColumn("Events", "messagueEmail"),
    ])
  },
};