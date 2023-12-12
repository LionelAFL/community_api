'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("SpeakerPanels", "description", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("SpeakerPanels", "description", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  }
};