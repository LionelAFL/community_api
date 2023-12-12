"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Events", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      organizer: Sequelize.STRING,
      date: Sequelize.STRING,
      time: Sequelize.STRING,
      timezone: Sequelize.STRING,
      category: Sequelize.STRING,
      ticket: {
        type: Sequelize.STRING,
        defaultValue: "free",
        values: ["free", "priced"],
      },
      type: Sequelize.ARRAY(Sequelize.STRING),
      location: Sequelize.ARRAY(Sequelize.STRING),
      description: Sequelize.JSON,
      link: Sequelize.STRING,
      externalLink: Sequelize.STRING,
      credit: Sequelize.JSON,
      code: Sequelize.STRING,
      image: Sequelize.STRING,
      image2: Sequelize.STRING,
      status: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Events");
  },
};
