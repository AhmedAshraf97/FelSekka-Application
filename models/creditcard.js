const Sequelize = require("sequelize");
module.exports = sequelize.define ("creditcards", {  
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
    cardnumber: {
        type: Sequelize.STRING(300),
        allowNull: false
    }, 
    cvv: {
        type: Sequelize.STRING(300),
        allowNull: false
    },
    expirationdate: {
        type: Sequelize.STRING(300),
        allowNull: false,
    }
  }
  );