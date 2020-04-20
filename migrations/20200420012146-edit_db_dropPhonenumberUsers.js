'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([
    queryInterface.removeColumn(
      'users',
      'phonenumber'
    )
     ]);
   },

  down: (queryInterface, Sequelize) => {
    }
  };