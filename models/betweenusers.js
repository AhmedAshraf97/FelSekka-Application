const Sequelize = require("sequelize");
module.exports = sequelize.define("betweenusers", {  
    id: {
      type: Sequelize.INTEGER(255),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    user1id: {
        type: Sequelize.INTEGER(255),
        allowNull: false
      },
    user2id:{
        type: Sequelize.INTEGER(255),
        allowNull: false
    },
    distance:{
        type:Sequelize.DECIMAL,
        allowNull: false
    },
    time:{
        type:Sequelize.DECIMAL,
        allowNull: false
    },
    trust:{
        type:Sequelize.INTEGER(255),
        allowNull: false,
        defaultValue=0
    }
  }
  );