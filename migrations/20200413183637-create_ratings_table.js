'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("ratings",{  
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
    rateduserid:{
        type: Sequelize.INTEGER(255),
        allowNull: false
    },
    rating:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    datetime:{
        type:Sequelize.DATE,
        allowNull: false
    },
    tripid:{
        type:Sequelize.INTEGER(255),
        allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("ratings");
  }
};
