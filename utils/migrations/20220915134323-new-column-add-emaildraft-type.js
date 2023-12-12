"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("EmailDraftChannel", "type", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("EmailDraftChannel", "type"),
    ])
  },
};