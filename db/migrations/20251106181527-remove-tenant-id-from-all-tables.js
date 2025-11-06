'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove tenant_id column from all tables that have it
    const tables = [
      'users',
      'buyer',
      'profiles',
      'orders',
      'inventory',
      'order_inventory',
      'order_profile'
    ];

    for (const table of tables) {
      try {
        // Check if column exists before trying to remove it
        const tableInfo = await queryInterface.describeTable(table);
        if (tableInfo.tenant_id) {
          await queryInterface.removeColumn(table, 'tenant_id');
          console.log(`Removed tenant_id from ${table}`);
        }
      } catch (error) {
        console.log(`Skipping ${table}: ${error.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Add tenant_id column back to all tables if needed for rollback
    const tables = [
      'users',
      'buyer',
      'profiles',
      'orders',
      'inventory',
      'order_inventory',
      'order_profile'
    ];

    for (const table of tables) {
      try {
        await queryInterface.addColumn(table, 'tenant_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'tenants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
        console.log(`Added tenant_id back to ${table}`);
      } catch (error) {
        console.log(`Skipping ${table}: ${error.message}`);
      }
    }
  }
};
