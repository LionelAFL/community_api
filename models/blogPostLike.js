"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlogPostLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BlogPostLike.belongsTo(models.BlogPost);
      BlogPostLike.belongsTo(models.User);
    }
  }

  BlogPostLike.init(
    {
      BlogPostId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "BlogPostLike",
      tableName: "BlogPostsLikes",
    }
  );
  return BlogPostLike;
};
