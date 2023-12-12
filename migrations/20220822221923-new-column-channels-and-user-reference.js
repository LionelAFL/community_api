'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Channels", "image2", {
        type: Sequelize.TEXT,
        defaultValue: "",
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Channels", "image2")
    ])
  },
};
