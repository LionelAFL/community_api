"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class LiveChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  LiveChat.init(
    {
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        videoUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        topics: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        documentFileName: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        documentFileUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        audioFileName: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        audioFileUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        idOrder: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
      sequelize,
      modelName: "LiveChat",
      tableName: "LiveChat",
      timestamps: false
    }
  );
  return LiveChat;
};
