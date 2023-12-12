"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("ChallengeStatusActivities", {
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
        idActivity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        completed: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("ChallengeStatusActivities"),
    ])
  },
};