"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // await queryInterface.addColumn("CouncilEvents", "status", {
    //   type: Sequelize.ENUM("active", "draft"),
    //   defaultValue: "draft",
    // });

    // await queryInterface.sequelize.query(
    //   // 'ALTER TYPE "enum_CouncilEvents_status" ADD VALUE "closed"'
    //   // 'ALTER TYPE "enum_CouncilEvents_status" ADD VALUE closed'
    // );

    await Promise.all([
      queryInterface.removeColumn("CouncilEvents", "status"),
      queryInterface.sequelize.query('DROP TYPE "enum_CouncilEvents_status"'),
      queryInterface.addColumn("CouncilEvents", "status", {
        type: Sequelize.ENUM("active", "draft", "closed"),
        defaultValue: "draft",
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
