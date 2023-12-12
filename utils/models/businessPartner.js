"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  class BusinessPartner extends Model {
    static associate(models) {
      BusinessPartner.belongsTo(models.User, { foreignKey: "UserId" });
      BusinessPartner.hasOne(models.BusinessPartnerComment);
    }
  }

  BusinessPartner.init(
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
      modelName: "BusinessPartner",
    }
  );
  return BusinessPartner;
};
