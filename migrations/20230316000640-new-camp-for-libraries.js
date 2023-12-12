"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("Challengue", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        startDate: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        endDate: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        image: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        image2: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      }),
      queryInterface.createTable("ChallengueUsers", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        idUser: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        idChallengue: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }),
      queryInterface.addColumn("Libraries", "idPanelCouncilRelation", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: -1,
      }),
      queryInterface.addColumn("Events", "bulCloseEvent", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("Challengue"),
      queryInterface.dropTable("ChallengueUsers"),
      queryInterface.removeColumn("Libraries", "idPanelCouncilRelation"),
      queryInterface.removeColumn("Events", "bulCloseEvent"),
    ])
  },
};