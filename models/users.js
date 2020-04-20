const Sequelize = require("sequelize");
module.exports = sequelize.define("users", {
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
        type: Sequelize.STRING(300),
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
        type: Sequelize.DATEONLY,
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

    smoking:{
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
    email:{
        type:Sequelize.STRING(300),
        allowNull: false,
    },
    latitude:{
        type:Sequelize.DECIMAL,
        allowNull: false  
    },
    longitude:{
        type:Sequelize.DECIMAL,
        allowNull: false  
    },
    username:{
        type:Sequelize.STRING(300),
        allowNull: false,
    }

  }
  );