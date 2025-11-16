'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update order_profile table
    await queryInterface.removeColumn('order_profile', 'material_rate');
    await queryInterface.removeColumn('order_profile', 'outer_diameter_mm');
    await queryInterface.removeColumn('order_profile', 'thickness_mm');
    await queryInterface.removeColumn('order_profile', 'heat_treatment_rate');
    await queryInterface.removeColumn('order_profile', 'heat_treatment_inefficacy_percent');

    await queryInterface.addColumn('order_profile', 'no_of_teeth', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'face', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'module', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'finish_size', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('order_profile', 'burning_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'ht_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'ht_rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'processes', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('order_profile', 'cyn_grinding', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'profile', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'grand_total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    // Update orders table - remove fields
    await queryInterface.removeColumn('orders', 'material_cost');
    await queryInterface.removeColumn('orders', 'process_costs');
    await queryInterface.removeColumn('orders', 'turning_rate');
    await queryInterface.removeColumn('orders', 'teeth_count');
    await queryInterface.removeColumn('orders', 'module');
    await queryInterface.removeColumn('orders', 'face');
    await queryInterface.removeColumn('orders', 'weight');
    await queryInterface.removeColumn('orders', 'ht_cost');
    await queryInterface.removeColumn('orders', 'rate');
    await queryInterface.removeColumn('orders', 'finish_size_width');
    await queryInterface.removeColumn('orders', 'finish_size_height');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert order_profile changes
    await queryInterface.removeColumn('order_profile', 'no_of_teeth');
    await queryInterface.removeColumn('order_profile', 'rate');
    await queryInterface.removeColumn('order_profile', 'face');
    await queryInterface.removeColumn('order_profile', 'module');
    await queryInterface.removeColumn('order_profile', 'finish_size');
    await queryInterface.removeColumn('order_profile', 'burning_cost');
    await queryInterface.removeColumn('order_profile', 'ht_cost');
    await queryInterface.removeColumn('order_profile', 'ht_rate');
    await queryInterface.removeColumn('order_profile', 'processes');
    await queryInterface.removeColumn('order_profile', 'cyn_grinding');
    await queryInterface.removeColumn('order_profile', 'total');
    await queryInterface.removeColumn('order_profile', 'profile');
    await queryInterface.removeColumn('order_profile', 'grand_total');

    await queryInterface.addColumn('order_profile', 'material_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'outer_diameter_mm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('order_profile', 'thickness_mm', {
      type: Sequelize.DECIMAL(10, 4),
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

    // Revert orders changes
    await queryInterface.addColumn('orders', 'material_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'process_costs', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'turning_rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'teeth_count', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'module', {
      type: Sequelize.DECIMAL(8, 3),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'face', {
      type: Sequelize.DECIMAL(8, 3),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'ht_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'finish_size_width', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'finish_size_height', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true
    });
  }
};
