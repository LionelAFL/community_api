"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SponsorsConference2023 extends Model {
    static associate(models) {

    }
  }
  SponsorsConference2023.init(
    {
        logo: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },

    {
      sequelize,
      modelName: "SponsorsConference2023",
      tableName: "SponsorsConference2023",
      timestamps: false
    }
  );
  return SponsorsConference2023;
};
