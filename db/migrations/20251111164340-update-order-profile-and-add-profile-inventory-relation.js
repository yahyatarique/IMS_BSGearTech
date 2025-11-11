'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add profile fields to order_profile table
    await queryInterface.addColumn('order_profile', 'name', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('order_profile', 'type', {
      type: Sequelize.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '0'
    });
    await queryInterface.addColumn('order_profile', 'material', {
      type: Sequelize.ENUM('CR-5', 'EN-9'),
      allowNull: false,
      defaultValue: 'CR-5'
    });
    await queryInterface.addColumn('order_profile', 'material_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'cut_size_width_mm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'cut_size_height_mm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'burning_wastage_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'heat_treatment_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('order_profile', 'heat_treatment_inefficacy_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });

    // Add inventory_id to profiles table
    await queryInterface.addColumn('profiles', 'inventory_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'inventory',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_profile', 'name');
    await queryInterface.removeColumn('order_profile', 'type');
    await queryInterface.removeColumn('order_profile', 'material');
    await queryInterface.removeColumn('order_profile', 'material_rate');
    await queryInterface.removeColumn('order_profile', 'cut_size_width_mm');
    await queryInterface.removeColumn('order_profile', 'cut_size_height_mm');
    await queryInterface.removeColumn('order_profile', 'burning_wastage_percent');
    await queryInterface.removeColumn('order_profile', 'heat_treatment_rate');
    await queryInterface.removeColumn('order_profile', 'heat_treatment_inefficacy_percent');
    await queryInterface.removeColumn('profiles', 'inventory_id');
  }
};
