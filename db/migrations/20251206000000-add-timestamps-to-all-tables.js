'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add updated_at to users table
    await queryInterface.addColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add updated_at to orders table
    await queryInterface.addColumn('orders', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add created_at and updated_at to profiles table
    await queryInterface.addColumn('profiles', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('profiles', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add created_at to order_sequence table
    await queryInterface.addColumn('order_sequence', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove updated_at from users table
    await queryInterface.removeColumn('users', 'updated_at');

    // Remove updated_at from orders table
    await queryInterface.removeColumn('orders', 'updated_at');

    // Remove created_at and updated_at from profiles table
    await queryInterface.removeColumn('profiles', 'created_at');
    await queryInterface.removeColumn('profiles', 'updated_at');

    // Remove created_at from order_sequence table
    await queryInterface.removeColumn('order_sequence', 'created_at');
  }
};
