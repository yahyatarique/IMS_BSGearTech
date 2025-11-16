'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('profiles', 'grand_total');
    await queryInterface.removeColumn('order_profile', 'grand_total');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('profiles', 'grand_total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'grand_total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });
  }
};
