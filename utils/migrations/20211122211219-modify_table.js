"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // return await Promise.all([
    //   queryInterface.removeColumn("Notifications", "onlyFor"),
    //   queryInterface.addColumn("Notifications", "onlyFor", {
    //     type: Sequelize.ARRAY(Sequelize.INTEGER),
    //     allowNull: false,
    //     defaultValue: [-1],
    //   }),
    // ]);
    return await queryInterface.changeColumn("Notifications", "onlyFor", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: false,
      defaultValue: [-1],
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // return await Promise.all([
    //   queryInterface.removeColumn("Notifications", "onlyFor"),
    //   queryInterface.addColumn("Notifications", "onlyFor", {
    //     type: Sequelize.ARRAY(Sequelize.INTEGER),
    //     allowNull: false,
    //     defaultValue: [],
    //   }),
    // ]);
    return await queryInterface.changeColumn("Notifications", "onlyFor", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: false,
      defaultValue: [],
    });
  },
};
