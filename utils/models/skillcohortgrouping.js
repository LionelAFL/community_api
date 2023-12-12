"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortGrouping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortGrouping.hasMany(models.SkillCohortGroupingMember);
    }
  }
  SkillCohortGrouping.init(
    {
      groupNumber: DataTypes.NUMBER,
      currentWeekNumber: DataTypes.NUMBER,
      meetingLink: DataTypes.STRING,
      meetingDateTime: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SkillCohortGrouping",
    }
  );
  return SkillCohortGrouping;
};
