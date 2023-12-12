"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilEventPanelist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilEventPanelist.belongsTo(models.User, { foreignKey: "UserId" });
      CouncilEventPanelist.belongsTo(models.CouncilEventPanel, {
        foreignKey: "CouncilEventPanelId",
        onDelete: "CASCADE",
      });
      CouncilEventPanelist.hasMany(models.CouncilEventPanelComment);
    }
  }
  CouncilEventPanelist.init(
    {
      isModerator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isAddedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "CouncilEventPanelist",
    }
  );
  return CouncilEventPanelist;
};
