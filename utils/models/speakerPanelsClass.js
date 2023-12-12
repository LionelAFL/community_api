"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerPanelsClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  SpeakerPanelsClass.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      AnnualConferenceId: DataTypes.INTEGER,
      videoUrl: DataTypes.STRING,
      duration: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      documentFileName: DataTypes.STRING,
      documentFileUrl: DataTypes.STRING,
      audioFileName: DataTypes.STRING,
      audioFileUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "SpeakerPanelsClass",
      tableName: "SpeakerPanelsClass",
      timestamps: false
    }
  );
  return SpeakerPanelsClass;
};