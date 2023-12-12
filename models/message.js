"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.Conversation);
    }
  }
  Message.init(
    {
      ConversationId: DataTypes.INTEGER,
      sender: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      viewedUser: DataTypes.ARRAY(DataTypes.INTEGER),
      documentFileUrl: DataTypes.TEXT,
      type: DataTypes.ENUM("text", "image", "audio", "document", "video"),
    },
    {
      sequelize,
    }
  );
  return Message;
};
