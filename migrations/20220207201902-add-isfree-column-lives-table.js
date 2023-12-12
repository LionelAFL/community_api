"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Lives", "isFree", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Lives", "isFree")]);
  },
};
