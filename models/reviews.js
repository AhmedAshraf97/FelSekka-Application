const Sequelize = require("sequelize");
module.exports = sequelize.define("reviews", {  
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
    }
  }
  );