"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Events", "bulSlack1Hour", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "message1Hours", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "bulSlack24Hour", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "message24Hours", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "bulSlack1Week", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
      queryInterface.addColumn("Events", "message1Week", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Events", "bulSlack1Hour"),
      queryInterface.removeColumn("Events", "message1Hours"),
      queryInterface.removeColumn("Events", "bulSlack24Hour"),
      queryInterface.removeColumn("Events", "message24Hours"),
      queryInterface.removeColumn("Events", "bulSlack1Week"),
      queryInterface.removeColumn("Events", "message1Week"),
    ])
  },
};