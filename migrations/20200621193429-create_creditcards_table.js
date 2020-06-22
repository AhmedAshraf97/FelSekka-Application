'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("creditcards", {  
      id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      userid: {
          type: Sequelize.INTEGER(255),
          allowNull: false
        }, 
      cardnumber: {
          type: Sequelize.STRING(300),
          allowNull: false
      }, 
      cvv: {
          type: Sequelize.STRING(300),
          allowNull: false
      },
      expirationdate: {
          type: Sequelize.STRING(300),
          allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("creditcards");
  }
};
