"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FilesPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      
    }
  }

  FilesPost.init(
    {
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      documentFileName: DataTypes.TEXT,
      documentFileUrl: DataTypes.TEXT,
      owner: DataTypes.TEXT,
      startDate: DataTypes.TEXT,
      documentFileImageUrl: DataTypes.TEXT,
      downloads: DataTypes.INTEGER,
      likes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "FilesPost",
      tableName: "FilesPost",
      timestamps: false
    }
  );
  return FilesPost;
};
