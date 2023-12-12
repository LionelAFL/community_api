"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LastEmailsNewsletterSend extends Model {

  }
  LastEmailsNewsletterSend.init(
    {
      idReference: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      emails: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      lastTimeRegisterCron: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      idUserlist: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: -1,
      }
    },

    {
      sequelize,
      modelName: "LastEmailsNewsletterSend",
      tableName: "LastEmailsNewsletterSend",
      timestamps: false
    }
  );
  return LastEmailsNewsletterSend;
};
