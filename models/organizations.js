const Sequelize = require("sequelize");
module.exports = sequelize.define("organizations", {
    id: {
      type: Sequelize.INTEGER(255),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "pending"
      } 
  }
  );