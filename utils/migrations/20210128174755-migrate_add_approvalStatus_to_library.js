"use strict";
const { ReviewStatus } = require("../enum");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn("Libraries", "approvalStatus", {
        type: Sequelize.STRING,
        values: [
          ReviewStatus.APPROVED,
          ReviewStatus.REJECTED,
          ReviewStatus.PENDING,
        ],
        defaultValue: ReviewStatus.PENDING,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
