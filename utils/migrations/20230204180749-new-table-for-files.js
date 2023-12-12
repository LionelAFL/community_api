"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("FilesPost", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      documentFileName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      documentFileUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      documentFileImageUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      downloads: {
        type: Sequelize.INTEGER,
        defaultValues: -1,
        allowNull: true,
      },
      likes: {
        type: Sequelize.INTEGER,
        defaultValues: -1,
        allowNull: true,
      },
      owner: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.TEXT,
        allowNull: false,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("FilesPost");
  },
};