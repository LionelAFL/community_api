"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilConversationLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilConversationLike.belongsTo(models.CouncilConversation, {
        foreignKey: "CouncilConversationId",
      });
      CouncilConversationLike.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  CouncilConversationLike.init(
    {},
    {
      sequelize,
      modelName: "CouncilConversationLike",
    }
  );
  return CouncilConversationLike;
};
