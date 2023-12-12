"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn("SpeakerPanels", "visible", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("SpeakerPanels", "visible");
  },
};