'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([
    queryInterface.addColumn(
      'users',
      'phonenumber',
      {
        type: Sequelize.STRING(300),
        allowNull: false
 
      }
    ) 
     ]);
   },

  down: (queryInterface, Sequelize) => {
    }
  };