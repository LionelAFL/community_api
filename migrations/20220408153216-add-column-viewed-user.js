"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "viewedUser", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "viewedUser", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    });
  },
};
