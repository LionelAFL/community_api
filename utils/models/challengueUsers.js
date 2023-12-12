"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

module.exports = (sequelize, DataTypes) => {
  class ChallengueUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  ChallengueUsers.init(
    {
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idChallengue: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
      sequelize,
      modelName: "ChallengueUsers",
      tableName: "ChallengueUsers",
      timestamps: false
    }
  );
  return ChallengueUsers;
};
