"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillCohortGroupingMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SkillCohortGroupingMember.belongsTo(models.SkillCohortGrouping);
      SkillCohortGroupingMember.belongsTo(models.User);
      SkillCohortGroupingMember.belongsTo(models.SkillCohortParticipant);
    }
  }
  SkillCohortGroupingMember.init(
    {},
    {
      sequelize,
      modelName: "SkillCohortGroupingMember",
    }
  );
  return SkillCohortGroupingMember;
};
