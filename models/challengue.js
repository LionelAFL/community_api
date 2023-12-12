"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class Challengue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  Challengue.init(
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        image2: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        timezone: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: ''
        }
    },
    {
      sequelize,
      modelName: "Challengue",
      tableName: "Challengue",
      timestamps: false
    }
  );
  return Challengue;
};
