"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Users",
        "dateSendEmailTermsConditionGConference",
        {
          type: Sequelize.DATE,
        }
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        "Users",
        "dateSendEmailTermsConditionGConference"
      ),
    ]);
  },
};
