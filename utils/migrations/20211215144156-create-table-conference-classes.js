"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AnnualConferenceClasses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      AnnualConferenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "AnnualConferences",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      videoUrl: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.STRING,
      },
      topics: Sequelize.ARRAY(Sequelize.STRING),
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
    await queryInterface.dropTable("AnnualConferenceClasses");
  },
};
