"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class ChallengueActivities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  ChallengueActivities.init(
    {
        idChallenge: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        date: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
      sequelize,
      modelName: "ChallengueActivities",
      tableName: "ChallengueActivities",
      timestamps: false
    }
  );
  return ChallengueActivities;
};
