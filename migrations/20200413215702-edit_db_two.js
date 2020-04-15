'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([
    queryInterface.addColumn(
        'organizations', 
        'status',
         {
          type: Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "pending"
        }
    ),
    queryInterface.addColumn(
        'offerridefrom',
        'date', 
        {
          type: Sequelize.DATEONLY,
          allowNull: false
        }    
    ),
    queryInterface.addColumn(
      'offerrideto',
      'date',
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