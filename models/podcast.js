"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class Podcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Podcast.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      order: DataTypes.INTEGER,
      imageUrl: DataTypes.STRING,
      dateEpisode: DataTypes.DATEONLY,
      vimeoLink: DataTypes.STRING,
      anchorLink: DataTypes.STRING,
      appleLink: DataTypes.STRING,
      googleLink: DataTypes.STRING,
      breakerLink: DataTypes.STRING,
      pocketLink: DataTypes.STRING,
      radioPublicLink: DataTypes.STRING,
      spotifyLink: DataTypes.STRING,
      iHeartRadioLink: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.STRING,
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
      duration: DataTypes.STRING,
      viewed: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      saveForLater: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      sendInEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Podcast",
    }
  );
  return Podcast;
};
