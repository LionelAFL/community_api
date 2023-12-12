"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Partner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Partner.init(
    {
      name: DataTypes.STRING,
      logoUrl: DataTypes.TEXT,
      description: DataTypes.STRING,
      url: DataTypes.STRING,
      categories: DataTypes.ARRAY(DataTypes.STRING),
      contact_name: DataTypes.STRING,
      contact_email: DataTypes.STRING,
      contact_phone: DataTypes.STRING,
      contact_position: DataTypes.STRING,
      demoUrl: DataTypes.STRING,
      categories: DataTypes.ARRAY(DataTypes.STRING),
      twitter: DataTypes.STRING,
      facebook: DataTypes.STRING,
      linkedin: DataTypes.STRING,
      instagram: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Partner",
    }
  );
  return Partner;
};
