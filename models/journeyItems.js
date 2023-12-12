"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JourneyItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  JourneyItems.init(
    {
      contentType: DataTypes.STRING,
      topic: DataTypes.INTEGER,
      contentId: DataTypes.INTEGER,
      viewed: DataTypes.BOOLEAN,
      removed: DataTypes.BOOLEAN,
      isNew: DataTypes.BOOLEAN,
      order: DataTypes.INTEGER,
      itemCreatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "JourneyItems",
    }
  );
  return JourneyItems;
};
