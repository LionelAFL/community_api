"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilEvent.hasMany(models.CouncilEventPanel);
    }
  }
  CouncilEvent.init(
    {
      eventName: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      description: DataTypes.TEXT,
      numberOfPanels: DataTypes.INTEGER,
      timezone: DataTypes.STRING,
      status: DataTypes.ENUM("draft", "active"),
      maxNumberOfPanelsUsersCanJoin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      linkComments: DataTypes.STRING,
      relationEventAdmin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: -1,
      }
    },
    {
      sequelize,
      modelName: "CouncilEvent",
    }
  );
  return CouncilEvent;
};
