'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add order_profile_id column to order_inventory table
    await queryInterface.addColumn('order_inventory', 'order_profile_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'order_profile',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Add index for better query performance
    await queryInterface.addIndex('order_inventory', ['order_profile_id'], {
      name: 'order_inventory_order_profile_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('order_inventory', 'order_inventory_order_profile_id_idx');
    
    // Remove column
    await queryInterface.removeColumn('order_inventory', 'order_profile_id');
  }
};
