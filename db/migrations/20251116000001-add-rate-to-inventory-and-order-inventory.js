'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('inventory', 'rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rate per unit'
    });

    await queryInterface.addColumn('order_inventory', 'rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rate per unit'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('inventory', 'rate');
    await queryInterface.removeColumn('order_inventory', 'rate');
  }
};
