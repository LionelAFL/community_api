"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailDraftChannel extends Model {
    static associate(models) {

    }
  }
  EmailDraftChannel.init(
    {
      idChannel: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      to: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          allowNull: false,
      },
      subject: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      message: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      draft: {
        type: DataTypes.BOOLEAN,
      },
      send: {
        type: DataTypes.BOOLEAN,
      },
      date: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.TEXT,
      },
      datePrograming: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    },

    {
      sequelize,
      modelName: "EmailDraftChannel",
      tableName: "EmailDraftChannel",
      timestamps: false
    }
  );
  return EmailDraftChannel;
};
