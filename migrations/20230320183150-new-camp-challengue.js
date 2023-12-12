"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Challengue", "timezone", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Challengue", "timezone"),
    ])
  },
};