"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("LastEmailsNewsletterSend", "idUserlist", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: -1
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("LastEmailsNewsletterSend", "idUserlist"),
    ])
  },
};