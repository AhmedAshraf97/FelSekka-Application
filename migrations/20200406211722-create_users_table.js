'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users",{
      id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      firstname: {
          type: Sequelize.STRING(300),
          allowNull: false
      },
      lastname: {
          type: Sequelize.STRING(300),
          allowNull: false
      },
      phonenumber: {
          type: Sequelize.INTEGER(255),
          allowNull: false
      },
      password: {
          type: Sequelize.STRING(300),
          allowNull: false
      },
      gender: {
          type: Sequelize.STRING(300),
          allowNull: false
      },  
      birthdate:{
          type: Sequelize.DATE,
          allowNull: false
      },
      photo:{
          type: Sequelize.STRING(300),
          allowNull: true
      },
      ridewith:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      pets:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      music:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      smooking:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      luggage:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      food:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      },
      babyseat:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "neutral"
      }, 
      rating:{
          type:Sequelize.DECIMAL,
          allowNull: false,
      },
      status:{
          type:Sequelize.STRING(300),
          allowNull: false,
          defaultValue: "existing"
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users");
  }
};
