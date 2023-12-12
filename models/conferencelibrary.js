"use strict";
const { Model } = require("sequelize");
const cryptoService = require("../services/crypto.service");

module.exports = (sequelize, DataTypes) => {
  class ConferenceLibrary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConferenceLibrary.init(
    {
      title: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      link: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      year: {
        type: DataTypes.INTEGER,
        defaultValue: 2019,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      meta: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      shrmCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("shrmCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      hrciCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("hrciCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      duration: DataTypes.STRING,
      viewed: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      saveForLater: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "ConferenceLibrary",
    }
  );
  return ConferenceLibrary;
};
