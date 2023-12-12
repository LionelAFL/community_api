'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SkillCohortGroupingMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SkillCohortGroupingsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SkillCohortGroupings',
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
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      numberOfCommentStrike: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      numberOfAssessmentStrike: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('SkillCohortGroupingMembers');
  }
};