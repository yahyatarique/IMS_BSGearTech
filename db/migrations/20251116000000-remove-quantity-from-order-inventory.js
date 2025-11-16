'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('inventory', 'quantity');

    await queryInterface.removeColumn('order_inventory', 'quantity');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity ordered'
    });

    await queryInterface.addColumn('order_inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity ordered'
    });
  }
};
