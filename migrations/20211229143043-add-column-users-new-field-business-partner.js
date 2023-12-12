"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Users", //table name
        "isBusinessPartner", //new field name
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        }
      ),
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isBusinessPartner");
  },
};
