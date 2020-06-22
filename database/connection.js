const Sequelize = require("sequelize");

const sequelize = new Sequelize("uLJohokxE6", "admin", "admin123", {
    host: "mygpdb.c4tgc4sarnec.us-east-1.rds.amazonaws.com",
    dialect: "mysql",
    operatorsAliases: false,
    logging: false
});

module.exports = sequelize;
global.sequelize = sequelize;