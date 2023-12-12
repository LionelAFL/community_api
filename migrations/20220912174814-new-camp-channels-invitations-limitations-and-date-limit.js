"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Channels", "invitationsSends", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
      queryInterface.addColumn("Channels", "dateLimitInvitations", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Channels", "invitationsSends"),
      queryInterface.removeColumn("Channels", "dateLimitInvitations"),
    ])
  },
};