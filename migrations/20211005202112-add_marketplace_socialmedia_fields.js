'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Marketplaces", "twitter", {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Marketplaces", "facebook", {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Marketplaces", "linkedin", {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Marketplaces", "instagram", {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropColumn("Marketplaces", "twitter"),
      queryInterface.dropColumn("Marketplaces", "facebook"),
      queryInterface.dropColumn("Marketplaces", "linkedin"),
      queryInterface.dropColumn("Marketplaces", "instagram"),
    ]);
  }
};
