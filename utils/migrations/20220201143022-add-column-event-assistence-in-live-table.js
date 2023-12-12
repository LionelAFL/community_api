"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Lives", //table name
        "eventAssistence", //new field name
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        }
      ),
      queryInterface.addColumn(
        "Lives", //table name
        "event", //new field name
        {
          type: Sequelize.STRING,
        }
      ),
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Lives", "eventAssistence");
    await queryInterface.removeColumn("Lives", "event");
  },
};
