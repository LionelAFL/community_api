"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EventInstructor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EventInstructor.belongsTo(models.Instructor, {
        foreignKey: "InstructorId",
      });
      EventInstructor.belongsTo(models.Event, {
        foreignKey: "EventId",
      });
    }
  }
  EventInstructor.init(
    {},
    {
      sequelize,
      modelName: "EventInstructor",
    }
  );
  return EventInstructor;
};
