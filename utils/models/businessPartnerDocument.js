"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BusinessPartnerDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BusinessPartnerDocument.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }
  BusinessPartnerDocument.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      documentFileName: DataTypes.STRING,
      documentFileUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "BusinessPartnerDocument",
    }
  );
  return BusinessPartnerDocument;
};
