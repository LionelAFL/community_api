"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // await queryInterface.sequelize.query(`drop type "enum_Messages_type";`);

    await queryInterface.addColumn("Messages", "documentFileUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "type", {
      type: Sequelize.ENUM("text", "image", "audio", "document", "video"),
      defaultValue: "text",
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query(`drop type "enum_Messages_type";`);
    await queryInterface.removeColumn("Messages", "documentFileUrl");
    await queryInterface.removeColumn("Messages", "type");
  },
};
