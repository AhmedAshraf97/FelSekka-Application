'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("reviews",{  
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
    revieweduserid:{
        type: Sequelize.INTEGER(255),
        allowNull: false
    },
    review:{
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
    return queryInterface.dropTable("reviews");
  }
};
