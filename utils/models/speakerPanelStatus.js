"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerPanelStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  SpeakerPanelStatus.init(
    {
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idSession: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        viewed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        saveForLater: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    },
    {
      sequelize,
      modelName: "SpeakerPanelStatus",
      tableName: "SpeakerPanelStatus",
      timestamps: false
    }
  );
  return SpeakerPanelStatus;
};