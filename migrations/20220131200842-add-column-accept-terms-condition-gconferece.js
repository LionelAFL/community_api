"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "acceptTermsConditionGConference", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "acceptTermsConditionGConference"),
    ]);
  },
};
