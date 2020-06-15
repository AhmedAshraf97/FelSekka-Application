const Sequelize = require("sequelize");
module.exports = sequelize.define ("trackings", {  
    id: {
      type: Sequelize.INTEGER(255),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    driverid: {
        type: Sequelize.INTEGER(255),
        allowNull: false
      }, 
    tripid: {
        type: Sequelize.INTEGER(255),
        allowNull: false
    }, 
    latitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    longitude: {
        type: Sequelize.DECIMAL,
        allowNull: false,
    }
  }
  );