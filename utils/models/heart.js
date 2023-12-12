"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Heart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Heart.hasMany(models.HeartUserRate);
    }
  }
  Heart.init(
    {
      category: DataTypes.STRING,
      parentId: DataTypes.INTEGER,
      content: DataTypes.STRING,
      rate: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "Heart",
    }
  );
  return Heart;
};
