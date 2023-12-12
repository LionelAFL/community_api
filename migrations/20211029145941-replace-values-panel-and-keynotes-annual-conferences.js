"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `UPDATE "AnnualConferences" SET type = 'Certificate Track and Panels' WHERE type = 'Panel' `
    );

    await queryInterface.sequelize.query(
      `UPDATE "AnnualConferences" SET type = 'Keynote/Fireside Chat' WHERE type = 'Keynote' `
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE "AnnualConferences" SET type = 'Panel' WHERE type = 'Certificate Track and Panels'  `
    );

    await queryInterface.sequelize.query(
      `UPDATE "AnnualConferences" SET type = 'Keynote' WHERE type = 'Keynote/Fireside Chat'  `
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
