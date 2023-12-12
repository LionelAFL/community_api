"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChallengeMessages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ChallengeMessages.belongsTo(models.User, {foreignKey: 'UserId'});
    }
  }
  ChallengeMessages.init(
    {
      comment: DataTypes.TEXT,
      PostId: DataTypes.INTEGER,
      PostCommentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ChallengeMessages",
    }
  );
  return ChallengeMessages;
};
