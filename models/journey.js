"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Journey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Journey.hasMany(models.JourneyItems);
    }
  }
  Journey.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.ARRAY(DataTypes.STRING),
      mainLanguage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Journey",
    }
  );
  return Journey;
};
