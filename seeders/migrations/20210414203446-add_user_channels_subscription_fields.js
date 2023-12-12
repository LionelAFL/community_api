'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     return Promise.all([
      queryInterface.addColumn("Users", "channelsSubscription", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("Users", "channelsSubscription_startdate", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
      queryInterface.addColumn("Users", "channelsSubscription_enddate", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "channelsSubscription"),
      queryInterface.removeColumn("Users", "channelsSubscription_startdate"),
      queryInterface.removeColumn("Users", "channelsSubscription_enddate"),
    ]);
  }
};
