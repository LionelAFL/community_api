"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("LastEmailsNewsletterSend", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        idReference: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        emails: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("LastEmailsNewsletterSend"),
    ])
  },
};