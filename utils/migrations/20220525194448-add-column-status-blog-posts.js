"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("BlogPosts", "status", {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "published",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("BlogPosts", "status", {
      type: Sequelize.ENUM("draft", "published"),
      defaultValue: "published",
    });
  },
};
