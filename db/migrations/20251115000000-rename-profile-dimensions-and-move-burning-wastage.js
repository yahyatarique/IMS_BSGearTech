'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns in profiles table
    await queryInterface.renameColumn('profiles', 'cut_size_width_mm', 'outer_diameter_mm');
    await queryInterface.renameColumn('profiles', 'cut_size_height_mm', 'thickness_mm');
    
    // Rename columns in order_profile table
    await queryInterface.renameColumn('order_profile', 'cut_size_width_mm', 'outer_diameter_mm');
    await queryInterface.renameColumn('order_profile', 'cut_size_height_mm', 'thickness_mm');
    
    // Add burning_wastage_percent to orders table
    await queryInterface.addColumn('orders', 'burning_wastage_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });
    
    // Remove burning_wastage_percent from profiles and order_profile tables
    await queryInterface.removeColumn('profiles', 'burning_wastage_percent');
    await queryInterface.removeColumn('order_profile', 'burning_wastage_percent');
  },

  async down(queryInterface, Sequelize) {
    // Revert profiles table column names
    await queryInterface.renameColumn('profiles', 'outer_diameter_mm', 'cut_size_width_mm');
    await queryInterface.renameColumn('profiles', 'thickness_mm', 'cut_size_height_mm');
    
    // Revert order_profile table column names
    await queryInterface.renameColumn('order_profile', 'outer_diameter_mm', 'cut_size_width_mm');
    await queryInterface.renameColumn('order_profile', 'thickness_mm', 'cut_size_height_mm');
    
    // Add burning_wastage_percent back to profiles and order_profile tables
    await queryInterface.addColumn('profiles', 'burning_wastage_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'burning_wastage_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });
    
    // Remove burning_wastage_percent from orders table
    await queryInterface.removeColumn('orders', 'burning_wastage_percent');
  }
};
