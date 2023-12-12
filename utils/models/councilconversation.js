"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilConversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilConversation.belongsTo(models.User, { foreignKey: "UserId" });
      CouncilConversation.hasMany(models.CouncilConversationComment);
      CouncilConversation.hasMany(models.CouncilConversationLike);
    }
  }
  CouncilConversation.init(
    {
      title: DataTypes.STRING,
      text: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      imageUrl: {
        type: DataTypes.STRING,
      },
      topics: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "CouncilConversation",
    }
  );
  return CouncilConversation;
};
