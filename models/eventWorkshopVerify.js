"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EventWorkshopVerify extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  EventWorkshopVerify.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        idEvent: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
      sequelize,
      modelName: "EventWorkshopVerify",
      tableName: "EventWorkshopVerify",
      timestamps: false
    }
  );
  return EventWorkshopVerify;
};
