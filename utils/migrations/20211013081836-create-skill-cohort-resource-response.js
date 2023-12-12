'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SkillCohortResourceResponses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SkillCohortResourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SkillCohortResources',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      SkillCohortParticipantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SkillCohortParticipants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      numberOfLikes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      numberOfDislikes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SkillCohortResourceResponses');
  }
};