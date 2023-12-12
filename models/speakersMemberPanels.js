"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerMemberPanel extends Model {

    static associate(models) {
        SpeakerMemberPanel.belongsTo(models.User, {foreignKey: 'UserId'})
        SpeakerMemberPanel.belongsTo(models.SpeakerPanel, {foreignKey: 'SpeakersPanelId'})
    }
  }
  SpeakerMemberPanel.init(
    {
      isModerator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },

    {
      sequelize,
      modelName: "SpeakerMemberPanel",
      tableName: "SpeakerMemberPanels"
    }
  );
  return SpeakerMemberPanel;
};
