"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ControlCertificate extends Model {
    static associate(models) {

    }
  }
  ControlCertificate.init(
    {
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idTypeCertificate: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        code: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },

    {
      sequelize,
      modelName: "ControlCertificate",
      tableName: "ControlCertificate",
      timestamps: false
    }
  );
  return ControlCertificate;
};