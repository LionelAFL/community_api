"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilEventPanelComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilEventPanelComment.belongsTo(models.CouncilEventPanelist, {
        foreignKey: "CouncilEventPanelistId",
      });
      CouncilEventPanelComment.belongsTo(models.CouncilEventPanel, {
        foreignKey: "CouncilEventPanelId",
      });
    }
  }
  CouncilEventPanelComment.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "CouncilEventPanelComment",
    }
  );
  return CouncilEventPanelComment;
};
