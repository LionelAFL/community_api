"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("BlogPosts", "summary", {
      type: Sequelize.TEXT,
      defaultValue: "",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("BlogPosts", "summary", {
      type: Sequelize.TEXT,
      defaultValue: "",
    });
  },
};
