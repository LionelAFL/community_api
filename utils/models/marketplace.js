"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Marketplace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Marketplace.belongsTo(models.MarketplaceCategories, {
        foreignKey: "MarketplaceCategoryId",
      });
    }
  }
  Marketplace.init(
    {
      name: DataTypes.STRING,
      logoUrl: DataTypes.STRING,
      description: DataTypes.STRING,
      url: DataTypes.STRING,
      contact_name: DataTypes.STRING,
      contact_email: DataTypes.STRING,
      contact_phone: DataTypes.STRING,
      contact_position: DataTypes.STRING,
      demoUrl: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      twitter: DataTypes.STRING,
      facebook: DataTypes.STRING,
      linkedin: DataTypes.STRING,
      instagram: DataTypes.STRING,
      isPartner: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Marketplace",
    }
  );
  return Marketplace;
};
