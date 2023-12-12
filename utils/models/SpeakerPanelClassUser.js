"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerPanelClassUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  SpeakerPanelClassUser.init(
    {
      viewed: DataTypes.BOOLEAN,
      progressVideo: DataTypes.DECIMAL,
      type: DataTypes.TEXT,
      UserId: DataTypes.INTEGER,
      AnnualConferenceClassId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "SpeakerPanelClassUser",
      tableName: "SpeakerPanelClassUser",
      timestamps: false
    }
  );
  return SpeakerPanelClassUser;
};
