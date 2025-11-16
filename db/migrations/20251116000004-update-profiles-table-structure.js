'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('profiles', 'heat_treatment_rate');
    await queryInterface.removeColumn('profiles', 'heat_treatment_inefficacy_percent');
    await queryInterface.removeColumn('profiles', 'outer_diameter_mm');
    await queryInterface.removeColumn('profiles', 'thickness_mm');
    await queryInterface.removeColumn('profiles', 'material_rate');

    // Add new columns
    await queryInterface.addColumn('profiles', 'no_of_teeth', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'face', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'module', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'finish_size', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('profiles', 'burning_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'ht_cost', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'ht_rate', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'processes', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('profiles', 'cyn_grinding', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'profile', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'grand_total', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns
    await queryInterface.removeColumn('profiles', 'no_of_teeth');
    await queryInterface.removeColumn('profiles', 'rate');
    await queryInterface.removeColumn('profiles', 'face');
    await queryInterface.removeColumn('profiles', 'module');
    await queryInterface.removeColumn('profiles', 'finish_size');
    await queryInterface.removeColumn('profiles', 'burning_cost');
    await queryInterface.removeColumn('profiles', 'ht_cost');
    await queryInterface.removeColumn('profiles', 'ht_rate');
    await queryInterface.removeColumn('profiles', 'processes');
    await queryInterface.removeColumn('profiles', 'cyn_grinding');
    await queryInterface.removeColumn('profiles', 'total');
    await queryInterface.removeColumn('profiles', 'profile');
    await queryInterface.removeColumn('profiles', 'grand_total');

    // Add back old columns
    await queryInterface.addColumn('profiles', 'heat_treatment_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'heat_treatment_inefficacy_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'outer_diameter_mm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'thickness_mm', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('profiles', 'material_rate', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0
    });
  }
};
