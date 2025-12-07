'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, rename existing columns
    await queryInterface.renameColumn('order_inventory', 'cut_size_width', 'width');
    await queryInterface.renameColumn('order_inventory', 'cut_size_height', 'height');

    // Then add quantity column if it doesn't exist
    await queryInterface.addColumn('order_inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity ordered'
    });

    // Update column definitions to match exactly with inventory table
    await queryInterface.changeColumn('order_inventory', 'width', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Width dimension in mm'
    });

    await queryInterface.changeColumn('order_inventory', 'height', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Height dimension in mm'
    });

    await queryInterface.changeColumn('order_inventory', 'material_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new quantity column
    await queryInterface.removeColumn('order_inventory', 'quantity');

    // Revert column names
    await queryInterface.renameColumn('order_inventory', 'width', 'cut_size_width');
    await queryInterface.renameColumn('order_inventory', 'height', 'cut_size_height');

    // Revert column definitions
    await queryInterface.changeColumn('order_inventory', 'cut_size_width', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Width dimension in mm'
    });

    await queryInterface.changeColumn('order_inventory', 'cut_size_height', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Height dimension in mm'
    });

    await queryInterface.changeColumn('order_inventory', 'material_weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg'
    });
  }
};