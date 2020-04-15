'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([
    queryInterface.addColumn(
      'users',
      'birthdate',
      {
        type: Sequelize.DATEONLY,
        allowNull: false
      }
    ) 
     ]);
   },

  down: (queryInterface, Sequelize) => {
    }
  };