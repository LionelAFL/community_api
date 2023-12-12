"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SimulationSprintActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SimulationSprintActivity.belongsTo(models.SimulationSprint, {
        foreignKey: "SimulationSprintId",
      });
    }
  }
  SimulationSprintActivity.init(
    {
      title: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM("Mandatory", "Recommended"),
        defaultValue: "Recommended",
      },
      deliveryDate: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "SimulationSprintActivity",
      tableName: "SimulationSprintActivites",
    }
  );
  return SimulationSprintActivity;
};
