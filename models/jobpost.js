"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JobPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      JobPost.belongsTo(models.User);
    }
  }
  JobPost.init(
    {
      jobTitle: DataTypes.STRING,
      jobDescription: DataTypes.JSONB,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      location: DataTypes.ARRAY(DataTypes.STRING),
      salaryRange: DataTypes.STRING,
      level: DataTypes.STRING,
      mainJobFunctions: DataTypes.ARRAY(DataTypes.STRING),
      preferredSkills: DataTypes.ARRAY(DataTypes.JSON),
      linkToApply: DataTypes.STRING,
      closingDate: DataTypes.DATE,
      companyName: DataTypes.STRING,
      companyLogo: DataTypes.STRING,
      companyDescription: DataTypes.TEXT,
      // status: DataTypes.ENUM("active", "draft", "expired", "closed"),
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "JobPost",
    }
  );
  return JobPost;
};
