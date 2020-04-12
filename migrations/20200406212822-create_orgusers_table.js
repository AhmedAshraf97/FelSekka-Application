'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable("orgusers",{id: {
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
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("orgusers");
  }
};
