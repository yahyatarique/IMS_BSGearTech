'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove po_number
    await queryInterface.removeColumn('inventory', 'po_number');
    await queryInterface.removeIndex('inventory', 'idx_inventory_po_number');

    // Rename cutsize columns to width and height
    await queryInterface.renameColumn('inventory', 'cut_size_width', 'width');
    await queryInterface.renameColumn('inventory', 'cut_size_height', 'height');

    // Add quantity column
    await queryInterface.addColumn('inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity of items in inventory'
    });

    // Update material_weight comment to reflect its usage
    await queryInterface.changeColumn('inventory', 'material_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg (for wastage calculation)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert changes
    await queryInterface.addColumn('inventory', 'po_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Related Purchase Order number'
    });

    // Recreate po_number index
    await queryInterface.addIndex('inventory', ['po_number'], {
      name: 'idx_inventory_po_number'
    });

    // Rename width and height back to cut_size_width and cut_size_height
    await queryInterface.renameColumn('inventory', 'width', 'cut_size_width');
    await queryInterface.renameColumn('inventory', 'height', 'cut_size_height');

    // Remove quantity column
    await queryInterface.removeColumn('inventory', 'quantity');

    // Revert material_weight comment
    await queryInterface.changeColumn('inventory', 'material_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg'
    });
  }
};