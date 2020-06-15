'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tracking", {  
      id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      driverid: {
          type: Sequelize.INTEGER(255),
          allowNull: false
        }, 
      latitude: {
          type: Sequelize.DECIMAL,
          allowNull: false
      },
      longitude: {
          type: Sequelize.DECIMAL,
          allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tracking");
  }
};
