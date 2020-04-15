'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("requestrideto",{  
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
    fromlatitude:{
        type:Sequelize.DECIMAL,
        allowNull: false
    },
    fromlongitude:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },
    toorgid:{
        type:Sequelize.INTEGER(255),
        allowNull: false,
    },
    date:{
        type:Sequelize.DATEONLY,
        allowNull: false,
    },
    arrivaltime:{
        type:Sequelize.TIME,
        allowNull: false,
    },
    ridewith:{
        type:Sequelize.STRING(300),
        allowNull: false,
    },
    smoking:{
        type:Sequelize.STRING(300),
        allowNull: false,
    },
    earliesttime:{
        type:Sequelize.TIME,
        allowNull: false,
    },
    status:{
        type:Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "pending"
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("requestrideto");
  }
};
