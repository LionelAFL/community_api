"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Events", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.addColumn("Podcasts", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.addColumn("Libraries", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Events", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.removeColumn("Podcasts", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.removeColumn("Libraries", "sendInEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
