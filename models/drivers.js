const Sequelize = require("sequelize");
module.exports = sequelize.define("drivers", {
    id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    tripid: {
        type: Sequelize.INTEGER(255),
        allowNull: false
    },
    tofrom: {
        type: Sequelize.STRING(300),
        allowNull: false
    },
    offerid: {
        type: Sequelize.INTEGER(255),
        allowNull: false
    },
    driverid: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
    },
    pickuptime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    arrivaltime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    actualpickuptime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    actualarrivaltime: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    distance: {
        type: Sequelize.DECIMAL,
        allowNull: false,
    },
    time: {
        type: Sequelize.DECIMAL,
        allowNull: false,
    },
    fare: {
        type: Sequelize.DECIMAL,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING(300),
        allowNull: false,
        defaultValue: "pending"
    }
});