"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      "AnnualConferenceClassUsers",
      "AnnualConferenceClassId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "AnnualConferenceClasses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );

    await queryInterface.changeColumn("AnnualConferenceClassUsers", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      "AnnualConferenceClassUsers",
      "AnnualConferenceClassId",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "AnnualConferenceClasses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );

    await queryInterface.changeColumn("AnnualConferenceClassUsers", "UserId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
