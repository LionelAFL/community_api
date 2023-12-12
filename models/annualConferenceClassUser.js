"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnnualConferenceClassUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AnnualConferenceClassUser.belongsTo(models.AnnualConferenceClass, {
        foreignKey: "AnnualConferenceClassId",
      });
      AnnualConferenceClassUser.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  AnnualConferenceClassUser.init(
    {
      viewed: DataTypes.BOOLEAN,
      progressVideo: DataTypes.DECIMAL,
      type: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "AnnualConferenceClassUser",
    }
  );
  return AnnualConferenceClassUser;
};
