"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "recruiterSubscription", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("Users", "recruiterSubscription_startdate", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
      queryInterface.addColumn("Users", "recruiterSubscription_enddate", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "recruiterSubscription"),
      queryInterface.removeColumn("Users", "recruiterSubscription_startdate"),
      queryInterface.removeColumn("Users", "recruiterSubscription_enddate"),
    ]);
  },
};
