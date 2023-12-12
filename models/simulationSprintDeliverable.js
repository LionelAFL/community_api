"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SimulationSprintDeliverable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SimulationSprintDeliverable.hasMany(models.SimulationSprintResource);
      SimulationSprintDeliverable.belongsTo(models.SimulationSprint, {
        foreignKey: "SimulationSprintId",
      });
    }
  }
  SimulationSprintDeliverable.init(
    {
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
      dueDate: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "SimulationSprintDeliverable",
    }
  );
  return SimulationSprintDeliverable;
};
