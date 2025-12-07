'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('profiles', 'total_weight', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'total_weight', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('profiles', 'total_weight');
    await queryInterface.removeColumn('order_profile', 'total_weight');
  }
};
