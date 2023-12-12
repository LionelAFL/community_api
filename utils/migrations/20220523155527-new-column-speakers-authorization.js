'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "speakersAuthorization", {
        type: Sequelize.STRING,
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "speakersAuthorization")
    ]);
  }
};