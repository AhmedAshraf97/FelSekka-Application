const Sequelize = require("sequelize");
module.exports = sequelize.define("cars", {
    
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
    brand:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    model:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    year:{
        type:Sequelize.INTEGER(255),
        allowNull: false
    },
    type:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    plateletters:{
        type:Sequelize.STRING(300),
        allowNull: true
    },
    platenumbers:{
        type:Sequelize.INTEGER(255),
        allowNull: true
    },
    nationalid:{
        type:Sequelize.INTEGER(255),
        allowNull: false
    },
    carlicensefront:{
        type:Sequelize.STRING(300),
        allowNull: false
    }, 
    carlicenseback:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    driverlicensefront:{
        type:Sequelize.STRING(300),
        allowNull: false
    }, 
    driverlicenseback:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    color:{
        type:Sequelize.STRING(300),
        allowNull: false
    },
    numberofseats:{
        type:Sequelize.INTEGER(255),
        allowNull: false
    },
    status:{
        type:Sequelize.STRING(300),
        allowNull:false,
        defaultValue:"existing"
    }
  }
  );