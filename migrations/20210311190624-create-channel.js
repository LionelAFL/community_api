"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Channels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      owner: {
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.STRING,
      },
      resources: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
      videos: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
      podcasts: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
      events: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      },
      followedUsers: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
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
    await queryInterface.dropTable("Channels");
  },
};
