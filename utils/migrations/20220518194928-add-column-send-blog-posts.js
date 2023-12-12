"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("BlogPosts", "send", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("BlogPosts", "send", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
};
