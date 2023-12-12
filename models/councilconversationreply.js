"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilConversationReply extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilConversationReply.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      CouncilConversationReply.belongsTo(models.CouncilConversationComment, {
        foreignKey: "CouncilConversationCommentId",
      });
    }
  }
  CouncilConversationReply.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "CouncilConversationReply",
    }
  );
  return CouncilConversationReply;
};
