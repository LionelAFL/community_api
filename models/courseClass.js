"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CourseClass.hasMany(models.CourseClassUser);
    }
  }
  CourseClass.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      videoUrl: DataTypes.STRING,
      duration: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "CourseClass",
    }
  );
  return CourseClass;
};
