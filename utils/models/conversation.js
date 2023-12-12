"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.hasMany(models.Message);
      Conversation.hasMany(models.User, {
        foreignKey: "id",
        foreignKeyConstraint: null,
      });
    }
  }
  Conversation.init(
    {
      members: DataTypes.ARRAY(DataTypes.INTEGER),
      showConversation: {
        defaultValue: true,
        type: DataTypes.BOOLEAN,
      },
    },

    {
      sequelize,
    }
  );
  return Conversation;
};
