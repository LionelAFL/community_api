"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Instructor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Instructor.hasMany(models.CourseInstructor);
      Instructor.hasOne(models.EventInstructor);
    }
  }
  Instructor.init(
    {
      image: DataTypes.STRING,
      name: DataTypes.STRING,
      link: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Instructor",
    }
  );
  return Instructor;
};
