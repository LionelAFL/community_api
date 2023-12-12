"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn(
      "MarketPlaceProfile",
      "isOpenReceivingEmail",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    );

    await queryInterface.addColumn(
      "MarketPlaceProfile",
      "jobPostIdsForEmailReceived",
      {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "MarketPlaceProfile",
      "isOpenReceivingEmail"
    );

    await queryInterface.removeColumn(
      "MarketPlaceProfile",
      "jobPostIdsForEmailReceived"
    );
  },
};
