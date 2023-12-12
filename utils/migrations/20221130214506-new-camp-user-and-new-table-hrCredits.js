"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "hrLoad", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.createTable("HrCredits", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        email: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        idUser: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        nameEvent: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "hrLoad"),
      queryInterface.dropTable("HrCredits"),
    ])
  },
};