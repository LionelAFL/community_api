"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "bulTicketImage", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "ticketImage", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "ticketImageType", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "bulTicketImage"),
      queryInterface.removeColumn("Events", "ticketImage"),
      queryInterface.removeColumn("Events", "ticketImageType"),
    ])
  },
};