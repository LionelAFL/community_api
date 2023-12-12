"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Channels", "lastEmailSent", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
      queryInterface.createTable("EmailDraftChannel", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        idChannel: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        to: {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          allowNull: false,
        },
        subject: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        }
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Channels", "lastEmailSent"),
      queryInterface.dropTable("EmailDraftChannel"),
    ])
  },
};