"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("EmailDraftChannel", "datePrograming", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("EmailDraftChannel", "datePrograming"),
    ])
  },
};