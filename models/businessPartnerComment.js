"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BusinessPartnerComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BusinessPartnerComment.belongsTo(models.User, { foreignKey: "UserId" });
      BusinessPartnerComment.belongsTo(models.BusinessPartner, {
        foreignKey: "id",
      });
    }
  }
  BusinessPartnerComment.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "BusinessPartnerComment",
    }
  );
  return BusinessPartnerComment;
};
