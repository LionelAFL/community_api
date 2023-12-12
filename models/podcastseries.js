"use strict";
const { Model } = require("sequelize");
const cryptoService = require("../services/crypto.service");

module.exports = (sequelize, DataTypes) => {
  class PodcastSeries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PodcastSeries.init(
    {
      title: DataTypes.STRING,
      img: DataTypes.STRING,
      description: DataTypes.TEXT,
      objectives: DataTypes.TEXT,
      duration: DataTypes.STRING,
      durationLearningBadges: DataTypes.STRING,
      podcasts: DataTypes.ARRAY(DataTypes.INTEGER),
      code: DataTypes.STRING,
      hrCreditOffered: DataTypes.TEXT,
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
      categories: DataTypes.ARRAY(DataTypes.STRING),
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
      modelName: "PodcastSeries",
    }
  );
  return PodcastSeries;
};
