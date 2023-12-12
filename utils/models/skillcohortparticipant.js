"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortParticipant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortParticipant.belongsTo(models.User, { foreignKey: "UserId" });
      SkillCohortParticipant.belongsTo(models.SkillCohort, {
        foreignKey: "SkillCohortId",
      });
      SkillCohortParticipant.hasMany(models.SkillCohortGroupingMember);
      SkillCohortParticipant.hasMany(models.SkillCohortResourceResponse);
      SkillCohortParticipant.hasMany(models.SkillCohortResponseAssessment);
      SkillCohortParticipant.hasMany(models.SkillCohortResponseRating);
    }
  }
  SkillCohortParticipant.init(
    {
      hasAccess: DataTypes.BOOLEAN,
      numberOfCommentStrike: DataTypes.INTEGER,
      numberOfAssessmentStrike: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SkillCohortParticipant",
    }
  );
  return SkillCohortParticipant;
};
