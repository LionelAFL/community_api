"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortResourceResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortResourceResponse.belongsTo(models.SkillCohortResources, {
        foreignKey: "SkillCohortResourceId",
      });
      SkillCohortResourceResponse.belongsTo(models.SkillCohortParticipant, {
        foreignKey: "SkillCohortParticipantId",
      });
      SkillCohortResourceResponse.hasMany(models.SkillCohortResponseAssessment);
      SkillCohortResourceResponse.hasMany(models.SkillCohortResponseRating);
    }
  }
  SkillCohortResourceResponse.init(
    {
      response: DataTypes.TEXT,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "SkillCohortResourceResponse",
    }
  );
  return SkillCohortResourceResponse;
};
