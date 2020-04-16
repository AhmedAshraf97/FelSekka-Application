const Sequelize = require("sequelize");
module.exports = sequelize.define("orgusers", {
    id: {
      type: Sequelize.INTEGER(255),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    orgid: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
      },
    userid: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
      },
    distancetoorg: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    timetoorg: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    distancefromorg: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    timefromorg: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    status:{
        type:Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "existing"
    }
  }
  );