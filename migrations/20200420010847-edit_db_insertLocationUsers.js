'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([
    queryInterface.addColumn(
      'users',
      'longitude',
      {
        type:Sequelize.DECIMAL,
        allowNull: false
      }
    ),
    queryInterface.addColumn(
      'users',
      'latitude',
      {
        type:Sequelize.DECIMAL,
        allowNull: false
      }
    ) 
     ]);
   },

  down: (queryInterface, Sequelize) => {
    }
  };