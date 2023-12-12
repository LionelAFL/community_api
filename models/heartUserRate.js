"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class HeartUserRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  HeartUserRate.init(
    {
      rate: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "HeartUserRate",
    }
  );
  return HeartUserRate;
};
