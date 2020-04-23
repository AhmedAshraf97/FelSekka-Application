const Sequelize = require("sequelize");
module.exports = sequelize.define("requestridefrom", {
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
    tolatitude: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    tolongitude: {
        type: Sequelize.DECIMAL,
        allowNull: false,
    },
    fromorgid: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    departuretime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    ridewith: {
        type: Sequelize.STRING(300),
        allowNull: false,
    },
    smoking: {
        type: Sequelize.STRING(300),
        allowNull: false,
    },
    latesttime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "pending"
    }
}, {
    freezeTableName: true,
    modelName: "requestridefrom",
});