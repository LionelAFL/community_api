"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  class Council extends Model {
    static associate(models) {
      Council.hasOne(models.CouncilComment);
    }
  }

  Council.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      link: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.STRING,
      language: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Council",
    }
  );
  return Council;
};
