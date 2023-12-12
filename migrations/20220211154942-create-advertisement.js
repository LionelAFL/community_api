"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Advertisements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // adBannerSize: {
      //   type: Sequelize.STRING,
      // },
      advertisementLink: {
        type: Sequelize.STRING,
      },
      adCostPerDay: {
        type: Sequelize.INTEGER,
      },
      adDurationByDays: {
        type: Sequelize.INTEGER,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      page: {
        type: Sequelize.STRING,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      datesBetweenStartDateAndEndDate: {
        type: Sequelize.ARRAY(Sequelize.DATE),
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
    await queryInterface.dropTable("Advertisements");
  },
};
