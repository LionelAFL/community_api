"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Conversations", "showConversation", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Conversations", "showConversation", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
