"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdvertisementClick extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AdvertisementClick.belongsTo(models.User, { foreignKey: "UserId" });
      AdvertisementClick.belongsTo(models.Advertisement, {
        foreignKey: "AdvertisementId",
      });
    }
  }
  AdvertisementClick.init(
    {},
    {
      sequelize,
      modelName: "AdvertisementClick",
    }
  );
  return AdvertisementClick;
};
