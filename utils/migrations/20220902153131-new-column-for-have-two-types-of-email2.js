"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("EmailDraftChannel", "send", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("EmailDraftChannel", "draft", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("EmailDraftChannel", "date", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("EmailDraftChannel", "send"),
      queryInterface.removeColumn("EmailDraftChannel", "draft"),
      queryInterface.removeColumn("EmailDraftChannel", "date"),
    ])
  },
};