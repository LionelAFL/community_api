"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("LiveChat", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        videoUrl: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        duration: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        topics: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: false,
        },
        documentFileName: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        documentFileUrl: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        audioFileName: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        audioFileUrl: {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      }),
      queryInterface.addColumn("Events", "includeHRCodes", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Events", "SHRMCode", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Events", "HRCICode", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
      queryInterface.addColumn("Events", "HRCICodeCreditType2", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
      }),
    ])
  
  },
  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("LiveChat"),
      queryInterface.removeColumn("Events", "includeHRCodes"),
      queryInterface.removeColumn("Events", "SHRMCode"),
      queryInterface.removeColumn("Events", "HRCICode"),
      queryInterface.removeColumn("Events", "HRCICodeCreditType2"),
    ])
    
  },
};