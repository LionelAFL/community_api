"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("EventWorkshopVerify", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      idEvent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      idUser: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("EventWorkshopVerify");
  },
};