'use strict';

const ConferenceType = require("../enum");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AnnualConferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING,
        values: Object.values(ConferenceType),
        defaultValue: ConferenceType.KEYNOTE,
      },
      startTime: {
        type: Sequelize.STRING
      },
      endTime: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      objectives: {
        type: Sequelize.TEXT
      },
      speakers: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
      link: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AnnualConferences');
  }
};