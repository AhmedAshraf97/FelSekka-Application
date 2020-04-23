const Sequelize = require("sequelize");
module.exports = sequelize.define("ratings", {  
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
        type:Sequelize.DECIMAL,
        allowNull: false
    },
    datetime:{
        type:Sequelize.DATE,
        allowNull: false
    },
    tripid:{
        type:Sequelize.INTEGER(255),
        allowNull: false,
    }
  }
  );