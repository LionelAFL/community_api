'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Podcasts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: Sequelize.STRING,
      description: Sequelize.STRING(1000),
      order: Sequelize.INTEGER,
      imageUrl: Sequelize.STRING,
      dateEpisode: Sequelize.DATEONLY,
      vimeoLink: Sequelize.STRING,
      anchorLink: Sequelize.STRING,
      appleLink: Sequelize.STRING,
      googleLink: Sequelize.STRING,
      breakerLink: Sequelize.STRING,
      pocketLink: Sequelize.STRING,
      radioPublicLink: Sequelize.STRING,
      spotifyLink: Sequelize.STRING,
      iHeartRadioLink: Sequelize.STRING,
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
    await queryInterface.dropTable("Podcasts");
  }
};
