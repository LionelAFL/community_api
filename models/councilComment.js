"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CouncilComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CouncilComment.belongsTo(models.User, { foreignKey: "UserId" });
      CouncilComment.belongsTo(models.Council, {
        foreignKey: "id",
      });
    }
  }
  CouncilComment.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "CouncilComment",
    }
  );
  return CouncilComment;
};
