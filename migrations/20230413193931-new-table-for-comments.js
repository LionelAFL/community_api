"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("ChallengeMessages", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        UserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        PostId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        PostCommentId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: ''
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("ChallengeMessages"),
    ])
  },
};