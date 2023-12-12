"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdvertisementImpression extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AdvertisementImpression.belongsTo(models.User, { foreignKey: "UserId" });
      AdvertisementImpression.belongsTo(models.Advertisement, {
        foreignKey: "AdvertisementId",
      });
      // define association here
    }
  }
  AdvertisementImpression.init(
    {},
    {
      sequelize,
      modelName: "AdvertisementImpression",
    }
  );
  return AdvertisementImpression;
};
