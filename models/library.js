"use strict";
const { Model } = require("sequelize");
const { ReviewStatus, Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class Library extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Library.belongsTo(models.Event, {
        foreignKey: "EventId",
      });
    }
  }
  Library.init(
    {
      title: DataTypes.STRING,
      link: DataTypes.STRING,
      description: DataTypes.TEXT,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.STRING,
      image: DataTypes.STRING,
      image2: DataTypes.STRING,
      language: DataTypes.STRING,
      recommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      approvalStatus: {
        type: DataTypes.STRING,
        values: [
          ReviewStatus.APPROVED,
          ReviewStatus.REJECTED,
          ReviewStatus.PENDING,
        ],
        defaultValue: ReviewStatus.PENDING,
      },
      level: {
        type: DataTypes.INTEGER,
        values: [VisibleLevel.DEFAULT, VisibleLevel.CHANNEL, VisibleLevel.ALL],
        defaultValue: VisibleLevel.DEFAULT,
      },
      channel: DataTypes.INTEGER,
      meta: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      shrmCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("shrmCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      hrciCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("hrciCode");

          return cryptoService().encrypt(rawValue);
        },
      },
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      duration: DataTypes.STRING,
      viewed: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      saveForLater: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sendInEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      orderLibraries: {
        type: DataTypes.INTEGER,
      },
      hrciCreditType: {
        type: DataTypes.TEXT
      },
      idPanelCouncilRelation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: -1,
      }
    },
    {
      sequelize,
      modelName: "Library",
    }
  );
  return Library;
};
