'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable("expiredtokens", {
            id: {
                type: Sequelize.INTEGER(255),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            token: {
                type: Sequelize.STRING(600),
                allowNull: false
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("expiredtokens");
    }
};