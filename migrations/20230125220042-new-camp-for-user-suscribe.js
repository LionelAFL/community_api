"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "suscribeSendingBlue", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "suscribeSendingBlue"),
    ])
  },
};