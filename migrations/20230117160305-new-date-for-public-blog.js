"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("BlogPosts", "datePublic", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "",
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("BlogPosts", "datePublic"),
    ])
  },
};