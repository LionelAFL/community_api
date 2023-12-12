'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("JourneyItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contentType: Sequelize.STRING,
      topic: Sequelize.STRING,
      contentId: Sequelize.INTEGER,
      viewed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      removed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      itemCreatedAt: Sequelize.DATE,
      JourneyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Journeys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable("JourneyItems");
  }
};
