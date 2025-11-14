'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove existing foreign key constraint
    await queryInterface.removeConstraint(
      'order_inventory',
      'order_inventory_inventory_id_fkey'
    );

    // Add foreign key constraint with NO ACTION on delete
    await queryInterface.addConstraint('order_inventory', {
      fields: ['inventory_id'],
      type: 'foreign key',
      name: 'order_inventory_inventory_id_fkey',
      references: {
        table: 'inventory',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the modified constraint
    await queryInterface.removeConstraint(
      'order_inventory',
      'order_inventory_inventory_id_fkey'
    );

    // Restore original constraint (assuming it was CASCADE)
    await queryInterface.addConstraint('order_inventory', {
      fields: ['inventory_id'],
      type: 'foreign key',
      name: 'order_inventory_inventory_id_fkey',
      references: {
        table: 'inventory',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
