"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Events", //table name
        "usersAssistence", //new field name
        {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          defaultValue: [],
        }
      ),
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Events", "usersAssistence");
  },
};
