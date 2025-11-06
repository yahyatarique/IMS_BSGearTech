'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove columns from inventory table
    await queryInterface.removeColumn('inventory', 'status');
    await queryInterface.removeColumn('inventory', 'location');
    await queryInterface.removeColumn('inventory', 'notes');

    // Remove columns from order_inventory table
    await queryInterface.removeColumn('order_inventory', 'weight_used');
    await queryInterface.removeColumn('order_inventory', 'location');
    await queryInterface.removeColumn('order_inventory', 'notes');
    await queryInterface.removeColumn('order_inventory', 'reserved_at');
    await queryInterface.removeColumn('order_inventory', 'used_at');
  },

  async down(queryInterface, Sequelize) {
    // Add columns back to inventory table
    await queryInterface.addColumn('inventory', 'status', {
      type: Sequelize.ENUM('available', 'reserved', 'used', 'damaged'),
      allowNull: false,
      defaultValue: 'available',
    });
    await queryInterface.addColumn('inventory', 'location', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('inventory', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add columns back to order_inventory table
    await queryInterface.addColumn('order_inventory', 'weight_used', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
    await queryInterface.addColumn('order_inventory', 'location', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('order_inventory', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('order_inventory', 'reserved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('order_inventory', 'used_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
