"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ConferenceLibraries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      link: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      year: {
        type: Sequelize.INTEGER,
        defaultValue: 2019,
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ConferenceLibraries");
  },
};
