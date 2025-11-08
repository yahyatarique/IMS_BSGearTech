'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to users table
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'User account status'
    });

    // Add status column to buyer table
    await queryInterface.addColumn('buyer', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'blocked'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Buyer account status'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('buyer', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('users', ['status']);
    await queryInterface.removeIndex('buyer', ['status']);

    // Remove columns
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('buyer', 'status');

    // Drop ENUM types (PostgreSQL specific)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_buyer_status";');
  }
};
