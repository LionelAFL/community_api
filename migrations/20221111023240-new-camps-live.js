"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Lives", "startAndEndTimes", {
        type: Sequelize.ARRAY(Sequelize.JSON),
        defaultValue: [],
      }),
      queryInterface.addColumn("Lives", "startDate", {
        type: Sequelize.STRING,
        defaultValue: '',
      }),
      queryInterface.addColumn("Lives", "endDate", {
        type: Sequelize.STRING,
        defaultValue: '',
      }),
      queryInterface.addColumn("Lives", "timezone", {
        type: Sequelize.STRING,
        defaultValue: '',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Lives", "startAndEndTimes"),
      queryInterface.removeColumn("Lives", "startDate"),
      queryInterface.removeColumn("Lives", "endDate"),
      queryInterface.removeColumn("Lives", "timezone"),
    ])
  },
};