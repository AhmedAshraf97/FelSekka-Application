const Sequelize = require("sequelize");

const sequelize = new Sequelize("uLJohokxE6", "uLJohokxE6", "XHw5dnoRy5", {
  host: "remotemysql.com",
  dialect: "mysql",
  operatorsAliases: false
});

module.exports = sequelize;
global.sequelize = sequelize;