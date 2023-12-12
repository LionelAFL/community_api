"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("MarketPlaceProfile", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isRecruiter: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      showMarketPlaceProfile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lookingFor: {
        type: Sequelize.STRING,
      },
      topics: Sequelize.ARRAY(Sequelize.STRING),
      location: Sequelize.ARRAY(Sequelize.STRING),
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("MarketPlaceProfile");
  },
};
