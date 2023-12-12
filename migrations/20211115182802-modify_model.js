"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return Promise.all([
      queryInterface.removeColumn("SkillCohortResources", "SkillCohortId"),
      queryInterface.removeColumn("SkillCohortParticipants", "SkillCohortId"),
      queryInterface.removeColumn("SkillCohortGroupings", "SkillCohortId"),
      queryInterface.removeColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortGroupingId"
      ),
      queryInterface.removeColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResourceResponses",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResourceResponses",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceResponseId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceResponseId"
      ),
      queryInterface.addColumn("SkillCohortResources", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("SkillCohortParticipants", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("SkillCohortGroupings", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortGroupingId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortGroupings",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResourceResponses",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResourceResponses",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceResponseId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResourceResponses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceResponseId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResourceResponses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn("SkillCohortResources", "SkillCohortId"),
      queryInterface.removeColumn("SkillCohortParticipants", "SkillCohortId"),
      queryInterface.removeColumn("SkillCohortGroupings", "SkillCohortId"),
      queryInterface.removeColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortGroupingId"
      ),
      queryInterface.removeColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResourceResponses",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResourceResponses",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceResponseId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortParticipantId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceId"
      ),
      queryInterface.removeColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceResponseId"
      ),
      queryInterface.addColumn("SkillCohortResources", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("SkillCohortParticipants", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("SkillCohortGroupings", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortGroupingId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortGroupings",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortGroupingMembers",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResourceResponses",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResourceResponses",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseAssessments",
        "SkillCohortResourceResponseId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResourceResponses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortParticipantId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortParticipants",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResources",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
      queryInterface.addColumn(
        "SkillCohortResponseRatings",
        "SkillCohortResourceResponseId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "SkillCohortResourceResponses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        }
      ),
    ]);
  },
};
