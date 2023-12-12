'use strict';

const db = require("../models");
const profileUtils = require("../utils/profile");

const User = db.User;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     const users = await User.findAll();
     const requests = users.map((user) => {
       const percentOfCompletion = profileUtils.getProfileCompletion(user);
       const completed = percentOfCompletion === 100;
 
       return User.update(
         {
           completed,
           percentOfCompletion,
         },
         {
           where: { id: user.id },
         }
       );
     });
     return Promise.all(requests);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
