'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("trips",{  
    id: {
      type: Sequelize.INTEGER(255),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    starttime: {
        type: Sequelize.TIME,
        allowNull: false
      },
    endtime: {
        type: Sequelize.TIME,
        allowNull: false
      },
    startloclatitude:{
        type:Sequelize.DECIMAL,
        allowNull: false
    },
    startloclongitude:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },
    endloclatitude:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },
    endloclongitude:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },
    totaldistance:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    }, 
    totaltime:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },  
    totalfare:{
        type:Sequelize.DECIMAL,
        allowNull: false,
    },
    numberofseats:{
        type:Sequelize.INTEGER(255),
        allowNull: false,
    },  
    date:{
      type:Sequelize.DATEONLY,
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
    return queryInterface.dropTable("trips");
  }
};
