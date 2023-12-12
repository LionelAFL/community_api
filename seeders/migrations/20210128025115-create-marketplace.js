'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Marketplaces", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: Sequelize.STRING,
      logoUrl: Sequelize.STRING,
      description: Sequelize.STRING(1000),
      url: Sequelize.STRING,
      MarketplaceCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'MarketplaceCategories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      contact_name: Sequelize.STRING,
      contact_email: Sequelize.STRING,
      contact_phone: Sequelize.STRING,
      contact_position: Sequelize.STRING,
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
    await queryInterface.dropTable("Marketplaces");
  }
};
