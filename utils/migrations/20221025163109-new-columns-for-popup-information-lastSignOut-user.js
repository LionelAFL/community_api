"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "lastDateSignOut", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Users", "limitDatePopUp", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Users", "bulPopup", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("Users", "arrayControlIdsMyLearning", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.addColumn("Users", "arrayControlIdsEvents", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "lastDateSignOut"),
      queryInterface.removeColumn("Users", "limitDatePopUp"),
      queryInterface.removeColumn("Users", "bulPopup"),
      queryInterface.removeColumn("Users", "arrayControlIdsMyLearning"),
      queryInterface.removeColumn("Users", "arrayControlIdsEvents"),
    ])
  },
};