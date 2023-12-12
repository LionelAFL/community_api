"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Channel.hasOne(models.User, {
        foreignKey: {
          name: "channel",
          allowNull: true,
        },
      });

      Channel.hasMany(models.BlogPost);
    }
  }
  Channel.init(
    {
      owner: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      resources: DataTypes.ARRAY(DataTypes.INTEGER),
      videos: DataTypes.ARRAY(DataTypes.INTEGER),
      podcasts: DataTypes.ARRAY(DataTypes.INTEGER),
      events: DataTypes.ARRAY(DataTypes.INTEGER),
      followedUsers: DataTypes.ARRAY(DataTypes.INTEGER),
      categories: DataTypes.ARRAY(DataTypes.STRING),
      image2: DataTypes.TEXT,
      image2: DataTypes.TEXT,
      lastEmailSent: DataTypes.TEXT,
      invitationsSends: DataTypes.INTEGER,
      dateLimitInvitations: DataTypes.TEXT,

    },
    {
      sequelize,
      modelName: "Channel",
    }
  );
  return Channel;
};
