const Sequelize = require("sequelize");
module.exports = sequelize.define("trips", {  
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
    date:{
        type:Sequelize.DATEONLY,
        allowNull: false,
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
    status:{
        type:Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "pending"
    }
  }
  );