'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the foreign key constraint and inventory_id column
    await queryInterface.removeConstraint('order_inventory', 'order_inventory_inventory_id_fkey');
    await queryInterface.removeIndex('order_inventory', 'idx_order_inventory_inventory_id');
    await queryInterface.removeIndex('order_inventory', 'idx_order_inventory_unique');
    await queryInterface.removeColumn('order_inventory', 'inventory_id');
    
    // Add inventory data columns to store denormalized values
    await queryInterface.addColumn('order_inventory', 'material_type', {
      type: Sequelize.ENUM('CR-5', 'EN-9'),
      allowNull: false,
      comment: 'Type of material used'
    });
    
    await queryInterface.addColumn('order_inventory', 'material_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg'
    });
    
    await queryInterface.addColumn('order_inventory', 'cut_size_width', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Width of the cut size in mm'
    });
    
    await queryInterface.addColumn('order_inventory', 'cut_size_height', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Height of the cut size in mm'
    });
    
    await queryInterface.addColumn('order_inventory', 'po_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Purchase order number for reference'
    });
    
    await queryInterface.addColumn('order_inventory', 'location', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Storage location of the material'
    });
    
    // Rename quantity_used to quantity for consistency
    await queryInterface.renameColumn('order_inventory', 'quantity_used', 'quantity');
    
    // Add index on material_type for filtering
    await queryInterface.addIndex('order_inventory', ['material_type'], {
      name: 'idx_order_inventory_material_type'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.removeIndex('order_inventory', 'idx_order_inventory_material_type');
    await queryInterface.removeColumn('order_inventory', 'location');
    await queryInterface.removeColumn('order_inventory', 'po_number');
    await queryInterface.removeColumn('order_inventory', 'cut_size_height');
    await queryInterface.removeColumn('order_inventory', 'cut_size_width');
    await queryInterface.removeColumn('order_inventory', 'material_weight');
    await queryInterface.removeColumn('order_inventory', 'material_type');
    
    // Rename quantity back to quantity_used
    await queryInterface.renameColumn('order_inventory', 'quantity', 'quantity_used');
    
    // Add back inventory_id and foreign key
    await queryInterface.addColumn('order_inventory', 'inventory_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    
    await queryInterface.addIndex('order_inventory', ['inventory_id'], {
      name: 'idx_order_inventory_inventory_id'
    });
    
    await queryInterface.addIndex('order_inventory', ['order_id', 'inventory_id'], {
      name: 'idx_order_inventory_unique',
      unique: true
    });
  }
};
