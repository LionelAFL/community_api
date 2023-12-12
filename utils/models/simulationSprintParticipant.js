"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SimulationSprintParticipant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SimulationSprintParticipant.belongsTo(models.SimulationSprint, {
        foreignKey: "SimulationSprintId",
      });
      SimulationSprintParticipant.belongsTo(models.SimulationSprintGroup, {
        foreignKey: "SimulationSprintGroupId",
      });
      SimulationSprintParticipant.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  SimulationSprintParticipant.init(
    {},
    {
      sequelize,
      modelName: "SimulationSprintParticipant",
    }
  );
  return SimulationSprintParticipant;
};
