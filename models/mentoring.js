"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mentoring extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Mentoring.init(
    {
      title: DataTypes.STRING,
      about: DataTypes.TEXT,
      areas: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      isMentor: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 1: mentor; 0: mentee
      },
      connectedMembers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      user: DataTypes.INTEGER,
      blockMatchAsMentor: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      blockMatchAsMentee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Mentoring",
    }
  );
  return Mentoring;
};
