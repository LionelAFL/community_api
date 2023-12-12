"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohort extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohort.hasMany(models.SkillCohortResources);
      SkillCohort.hasMany(models.SkillCohortParticipant);
      SkillCohort.hasMany(models.SkillCohortGrouping);
    }
  }
  SkillCohort.init(
    {
      title: DataTypes.STRING,
      howProjectXWorks: DataTypes.JSON,
      description: DataTypes.JSON,
      objectives: DataTypes.STRING,
      image: DataTypes.STRING,
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SkillCohort",
    }
  );
  return SkillCohort;
};
