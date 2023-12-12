"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SimulationSprintResource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SimulationSprintResource.belongsTo(models.SimulationSprint, {
        foreignKey: "SimulationSprintId",
      });
      SimulationSprintResource.belongsTo(models.SimulationSprintDeliverable, {
        foreignKey: "SimulationSprintDeliverableId",
      });
    }
  }
  SimulationSprintResource.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      level: DataTypes.ENUM("basic", "intermediate", "advance"),
      type: DataTypes.ENUM("video", "article", "podcast"),
      resourceLink: DataTypes.STRING,
      releaseDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SimulationSprintResource",
    }
  );
  return SimulationSprintResource;
};
