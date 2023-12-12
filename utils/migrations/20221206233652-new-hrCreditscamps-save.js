"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("HrCredits", "shrmCode", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
      queryInterface.addColumn("HrCredits", "hrciCode", {
        type: Sequelize.TEXT,
        defaultValue: '',
      }),
      queryInterface.addColumn("HrCredits", "eventRelation", {
        type: Sequelize.INTEGER,
        defaultValue: -1,
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("HrCredits", "shrmCode"),
      queryInterface.removeColumn("HrCredits", "hrciCode"),
      queryInterface.removeColumn("HrCredits", "eventRelation"),
    ])
  },
};