"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnnualConference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AnnualConference.hasMany(models.Instructor, {
        foreignKey: "id",
        foreignKeyConstraint: null,
      });
    }
  }
  AnnualConference.init(
    {
      title: DataTypes.STRING,
      type: {
        type: DataTypes.STRING,
        values: Object.values(ConferenceType),
        defaultValue: ConferenceType.KEYNOTE,
      },
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      startTime: DataTypes.STRING,
      endTime: DataTypes.STRING,
      timezone: DataTypes.STRING,
      description: DataTypes.TEXT,
      objectives: DataTypes.TEXT,
      meta: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      speakers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      link: DataTypes.STRING,
      recertification_credits: DataTypes.STRING,
      viewed: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      saveForLater: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },

    {
      sequelize,
      modelName: "AnnualConference",
    }
  );
  return AnnualConference;
};
