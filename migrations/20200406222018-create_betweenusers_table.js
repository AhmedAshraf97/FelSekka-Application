'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("betweenusers",{
      id: {
        type: Sequelize.INTEGER(255),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user1id: {
          type: Sequelize.INTEGER(255),
          allowNull: false
        },
      user2id:{
          type: Sequelize.INTEGER(255),
          allowNull: false
      },
      distance:{
          type:Sequelize.DECIMAL,
          allowNull: false
      },
      time:{
          type:Sequelize.DECIMAL,
          allowNull: false
      },
      trust:{
          type:Sequelize.INTEGER(255),
          allowNull: false,
          defaultValue: 0
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("betweenusers");
  }
};
