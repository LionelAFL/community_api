"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MarketPlaceProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MarketPlaceProfile.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }
  MarketPlaceProfile.init(
    {
      isRecruiter: DataTypes.BOOLEAN,
      showMarketPlaceProfile: DataTypes.BOOLEAN,
      lookingFor: DataTypes.ARRAY(DataTypes.STRING),
      topics: DataTypes.ARRAY(DataTypes.STRING),
      location: DataTypes.ARRAY(DataTypes.STRING),
      skills: DataTypes.JSONB,
      isOpenReceivingEmail: DataTypes.BOOLEAN,
      jobPostIdsForEmailReceived: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    {
      sequelize,
      modelName: "MarketPlaceProfile",
      freezeTableName: "MarketPlaceProfile",
    }
  );
  return MarketPlaceProfile;
};
