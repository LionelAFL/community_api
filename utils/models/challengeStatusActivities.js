"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ChallengeStatusActivities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  ChallengeStatusActivities.init(
    {
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idActivity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    },
    {
      sequelize,
      modelName: "ChallengeStatusActivities",
      tableName: "ChallengeStatusActivities",
      timestamps: false
    }
  );
  return ChallengeStatusActivities;
};