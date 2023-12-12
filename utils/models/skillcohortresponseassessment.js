"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortResponseAssessment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortResponseAssessment.belongsTo(
        models.SkillCohortResourceResponse,
        {
          foreignKey: "SkillCohortResourceResponseId",
        }
      );
      SkillCohortResponseAssessment.belongsTo(models.SkillCohortParticipant, {
        foreignKey: "SkillCohortParticipantId",
      });
      SkillCohortResponseAssessment.belongsTo(models.SkillCohortResources, {
        foreignKey: "SkillCohortResourceId",
      });
    }
  }
  SkillCohortResponseAssessment.init(
    {
      assessment: DataTypes.TEXT,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "SkillCohortResponseAssessment",
    }
  );
  return SkillCohortResponseAssessment;
};
