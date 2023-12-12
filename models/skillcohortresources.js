"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortResources extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortResources.hasMany(models.SkillCohortResourceResponse);
      SkillCohortResources.hasMany(models.SkillCohortResponseAssessment);
      SkillCohortResources.hasMany(models.SkillCohortResponseRating);
      SkillCohortResources.belongsTo(models.SkillCohort, {
        foreignKey: "SkillCohortId",
      });
    }
  }
  SkillCohortResources.init(
    {
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
      level: DataTypes.ENUM("basic", "intermediate", "advance"),
      type: DataTypes.ENUM("video", "article", "podcast"),
      duration: DataTypes.STRING,
      resourceLink: DataTypes.TEXT,
      releaseDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SkillCohortResources",
    }
  );
  return SkillCohortResources;
};
