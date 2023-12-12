"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilConversationComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilConversationComment.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      CouncilConversationComment.belongsTo(models.CouncilConversation, {
        foreignKey: "CouncilConversationId",
      });
      CouncilConversationComment.hasMany(models.CouncilConversationReply);
    }
  }
  CouncilConversationComment.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "CouncilConversationComment",
    }
  );
  return CouncilConversationComment;
};
