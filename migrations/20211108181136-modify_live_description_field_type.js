'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   
    return Promise.all([
      queryInterface.changeColumn('Lives', 'description', {
          type: Sequelize.TEXT,
          allowNull: false,
      })
    ])
  },
  down: async (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.changeColumn('Lives', 'description', {
          type: Sequelize.STRING,
          allowNull: false,
      })
    ])
  }
};
                 