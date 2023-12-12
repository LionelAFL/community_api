"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ParrafConference2023 extends Model {
    static associate(models) {

    }
  }
  ParrafConference2023.init(
    {
        visual: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },

    {
      sequelize,
      modelName: "ParrafConference2023",
      tableName: "ParrafConference2023",
      timestamps: false
    }
  );
  return ParrafConference2023;
};
