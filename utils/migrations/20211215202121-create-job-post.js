"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("JobPosts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING,
      },
      jobDescription: {
        type: Sequelize.JSONB,
      },
      city: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      salary: {
        type: Sequelize.STRING,
      },
      level: {
        type: Sequelize.STRING,
      },
      preferredSkills: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      linkToApply: {
        type: Sequelize.STRING,
      },
      closingDate: {
        type: Sequelize.DATE,
      },
      timezone: {
        type: Sequelize.STRING,
      },
      companyName: {
        type: Sequelize.STRING,
      },
      companyLogo: {
        type: Sequelize.STRING,
      },
      companyDescription: {
        type: Sequelize.TEXT,
      },
      status: {
        // type: Sequelize.ENUM("active", "draft", "expired", "closed"),
        type: Sequelize.STRING,
        validate: {
          customValidator: (value) => {
            const enums = ["active", "draft", "expired", "closed"];
            if (!enums.includes(value)) {
              throw new Error("not a valid option");
            }
          },
        },
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
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
    await queryInterface.dropTable("JobPosts");
  },
};
