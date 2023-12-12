"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlogPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BlogPost.belongsTo(models.Channel);
      BlogPost.belongsTo(models.User);
      BlogPost.hasMany(models.BlogPostLike);
    }
  }

  BlogPost.init(
    {
      imageUrl: DataTypes.STRING,
      title: DataTypes.TEXT,
      description: DataTypes.JSON,
      categories: DataTypes.ARRAY(DataTypes.STRING),
      UserId: DataTypes.INTEGER,
      ChannelId: DataTypes.INTEGER,
      summary: DataTypes.TEXT,
      send: DataTypes.BOOLEAN,
      status: DataTypes.ENUM("draft", "published"),
      datePublic: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "BlogPost",
      tableName: "BlogPosts",
    }
  );
  return BlogPost;
};
