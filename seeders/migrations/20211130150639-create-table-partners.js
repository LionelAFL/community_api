"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("Partners", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: Sequelize.STRING,
      logoUrl: Sequelize.TEXT,
      demoUrl: Sequelize.STRING,
      description: Sequelize.STRING(1000),
      url: Sequelize.STRING,
      categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      contact_name: Sequelize.STRING,
      contact_email: Sequelize.STRING,
      contact_phone: Sequelize.STRING,
      contact_position: Sequelize.STRING,
      twitter: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      },
      facebook: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      },
      linkedin: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      },
      instagram: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("Partners");
  },
};
