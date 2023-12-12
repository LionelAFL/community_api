"use strict";
const { Model } = require("sequelize");
const cryptoService = require("../services/crypto.service");

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.hasMany(models.CourseClass);
      Course.hasMany(models.CourseSponsor);
      Course.hasMany(models.CourseInstructor);
    }
  }
  Course.init(
    {
      image: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      shrmCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("shrmCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      hrciCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("hrciCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      hrCreditOffered: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};
