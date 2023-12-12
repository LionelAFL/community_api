"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.hasMany(models.PostLike);
      Post.hasMany(models.PostComment);
      Post.hasMany(models.PostFollow);
      Post.belongsTo(models.User, {foreignKey: 'UserId'})
    }
  }
  Post.init(
    {
      text: DataTypes.TEXT,
      imageUrl: DataTypes.STRING,
      videoUrl: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
