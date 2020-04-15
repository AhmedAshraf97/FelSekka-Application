'use strict';

    module.exports = {
      up: (queryInterface, Sequelize) => {
     return Promise.all([queryInterface.renameColumn(
     'users',
     'smooking',
     'smoking'
      ),

    queryInterface.removeColumn(
      'organizations',
      'status'
      ),


    queryInterface.removeColumn(
     'users',
     'pets'
      ),
    
    queryInterface.removeColumn(
      'users',
      'music'
      ),
      
    queryInterface.removeColumn(
      'users',
      'luggage'
      ),
    
    queryInterface.removeColumn(
      'users',
      'food'
      ),
    queryInterface.removeColumn(
      'users',
      'babyseat'
      ),

    queryInterface.removeColumn(
        'offerridefrom',
        'date'
    ),
    queryInterface.removeColumn(
      'offerrideto',
      'date'
    )
    
     ]);
   },

  down: (queryInterface, Sequelize) => {
    }
  };