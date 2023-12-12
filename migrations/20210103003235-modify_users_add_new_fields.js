"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // return Promise.all([
    //   queryInterface.addColumn(
    //     "Users", // table name
    //     "company", // new field name
    //     {
    //       type: Sequelize.STRING,
    //       allowNull: true,
    //     }
    //   ),
    //   queryInterface.addColumn("Users", "about", {
    //     type: Sequelize.STRING,
    //     allowNull: true,
    //   }),
    //   queryInterface.addColumn("Users", "titleProfessions", {
    //     type: Sequelize.TEXT,
    //     allowNull: true,
    //   }),
    //   queryInterface.addColumn("Users", "proficiencyLevel", {
    //     type: Sequelize.TEXT,
    //     allowNull: true,
    //   }),
    //   queryInterface.addColumn("Users", "topicsOfInterest", {
    //     type: Sequelize.ARRAY(Sequelize.STRING),
    //     allowNull: true,
    //     defaultValue: [],
    //   }),
    //   queryInterface.addColumn("Users", "personalLinks", {
    //     type: Sequelize.JSON,
    //     defaultValue: {},
    //   }),
    //   queryInterface.addColumn("Users", "langulage", {
    //     type: Sequelize.STRING,
    //     allowNull: true,
    //   }),
    //   queryInterface.addColumn("Users", "timezone", {
    //     type: Sequelize.STRING,
    //     allowNull: true,
    //   }),
    //   queryInterface.addColumn("Users", "completed", {
    //     type: Sequelize.BOOLEAN,
    //     allowNull: true,
    //     defaultValue: false,
    //   }),
    //   queryInterface.addColumn("Users", "percentOfCompletion", {
    //     type: Sequelize.INTEGER,
    //   }),
    // ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "company"),
      queryInterface.removeColumn("Users", "about"),
      queryInterface.removeColumn("Users", "titleProfessions"),
      queryInterface.removeColumn("Users", "proficiencyLevel"),
      queryInterface.removeColumn("Users", "topicsOfInterest"),
      queryInterface.removeColumn("Users", "personalLinks"),
      queryInterface.removeColumn("Users", "language"),
      queryInterface.removeColumn("Users", "timezone"),
      queryInterface.removeColumn("Users", "completed"),
      queryInterface.removeColumn("Users", "percentOfCompletion"),
    ]);
  },
};
