"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("LiveChat", "idOrder", {
        type: Sequelize.INTEGER,
        allowNull: true,
        autoIncrement: true,
      }),
      queryInterface.changeColumn("LiveChat", "duration", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.changeColumn("LiveChat", "topics", {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("LiveChat", "idOrder"),
      queryInterface.changeColumn("LiveChat", "duration", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
      queryInterface.changeColumn("LiveChat", "topics", {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
      }),
    ])
  },
};