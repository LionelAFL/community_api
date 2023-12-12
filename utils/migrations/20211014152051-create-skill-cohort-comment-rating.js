'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SkillCohortResponseRatings', {
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
      SkillCohortResourceResponseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SkillCohortResourceResponses',
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
      rating: {
        type: Sequelize.ENUM('like', 'dislike')
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
    await queryInterface.dropTable('SkillCohortResponseRatings');
  }
};