"use strict";

const db = require("../models");

const Category = db.Category;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const categories = [
      { text: "Agility", value: "agility" },
      { text: "Culture", value: "culture" },
      { text: "Design Thinking", value: "design-thinking" },
      {
        text: "Diversity, Equity, Inclusion and Belonging",
        value: "diversity-equity-inclusion-belonging",
      },
      {
        text: "Employee Experience and Engagement",
        value: "employee-experience-and-engagement",
      },
      { text: "Future of Work", value: "future-of-work" },
      { text: "HR Strategy", value: "hr-strategy" },
      { text: "Innovation", value: "innovation" },
      { text: "Job seekers", value: "job-seekers" },
      { text: "Leadership", value: "leadership" },
      { text: "Learning and Development", value: "learning-and-development" },
      { text: "Marketing and Branding", value: "marketing-and-branding" },
      {
        text: "People Science and People Analytics ",
        value: "people-science-analytics",
      },
      { text: "Performance Management", value: "performance-management" },
      { text: "Recruitment and Talent", value: "recruitment-and-talent" },
      { text: "Remote Work", value: "remote-work" },
      {
        text: "Strategy and Transformation",
        value: "strategy-and-transformation",
      },
      { text: "Technology", value: "technology" },
      { text: "Wellness and Wellbeing", value: "wellness-and-wellbeing" },
    ];

    return Promise.all(
      categories.map((item) =>
        Category.create({ title: item.text, value: item.value })
      )
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
