"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Live extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Live.init(
    {
      live: DataTypes.BOOLEAN,
      eventAssistence: DataTypes.BOOLEAN,
      event: DataTypes.STRING,
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      description: DataTypes.STRING,
      isFree: DataTypes.BOOLEAN,
      startDate: DataTypes.STRING,
      endDate: DataTypes.STRING,
      timezone: DataTypes.STRING,
      startAndEndTimes: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "Live",
    }
  );
  return Live;
};
