"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class HrCredits extends Model {

  }
  HrCredits.init(
    {
        email: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        nameEvent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        shrmCode: {
            type: DataTypes.TEXT,
          defaultValue: '',
        },
        hrciCode: {
          type: DataTypes.TEXT,
          defaultValue: '',
        },
        eventRelation: {
          type: DataTypes.INTEGER,
          defaultValue: -1,
        },
    },
    {
      sequelize,
      modelName: "HrCredits",
      tableName: "HrCredits",
      timestamps: false
    }
  );
  return HrCredits;
};
