'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("organizations",{
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
          default: "pending"
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("organizations");
  }
};
