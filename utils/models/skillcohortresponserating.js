"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortResponseRating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortResponseRating.belongsTo(models.SkillCohortResourceResponse, {
        foreignKey: "SkillCohortResourceResponseId",
      });
      SkillCohortResponseRating.belongsTo(models.SkillCohortParticipant, {
        foreignKey: "SkillCohortParticipantId",
      });
      SkillCohortResponseRating.belongsTo(models.SkillCohortResources, {
        foreignKey: "SkillCohortResourceId",
      });
    }
  }
  SkillCohortResponseRating.init(
    {
      rating: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "SkillCohortResponseRating",
    }
  );
  return SkillCohortResponseRating;
};
