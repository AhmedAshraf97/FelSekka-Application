const Sequelize = require("sequelize");
module.exports = sequelize.define("expiredtokens", {
    id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    token: {
        type: Sequelize.STRING(1000),
        allowNull: false
    }
});