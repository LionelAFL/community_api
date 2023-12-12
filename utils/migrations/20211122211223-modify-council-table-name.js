"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("Council", "Councils");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Councils");
  },
};
