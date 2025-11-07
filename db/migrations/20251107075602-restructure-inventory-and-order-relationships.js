'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove quantity column from inventory table
    await queryInterface.removeColumn('inventory', 'quantity');

    // 2. Add profile_id to order_profile table
    await queryInterface.addColumn('order_profile', 'profile_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily allow null for existing records
      references: {
        model: 'profiles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 3. Add inventory_id to order_inventory table
    await queryInterface.addColumn('order_inventory', 'inventory_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily allow null for existing records
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 4. Remove quantity column from order_inventory table
    await queryInterface.removeColumn('order_inventory', 'quantity');

    // Note: In a production scenario, you would need to:
    // - Populate profile_id in order_profile from profile_snapshot data
    // - Populate inventory_id in order_inventory by matching material specs
    // - Then make the columns non-nullable with:
    //   await queryInterface.changeColumn('order_profile', 'profile_id', { allowNull: false });
    //   await queryInterface.changeColumn('order_inventory', 'inventory_id', { allowNull: false });
  },

  async down(queryInterface, Sequelize) {
    // Reverse the changes

    // 1. Add quantity back to inventory table
    await queryInterface.addColumn('inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity of items in inventory',
    });

    // 2. Add quantity back to order_inventory table
    await queryInterface.addColumn('order_inventory', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity of items',
    });

    // 3. Remove inventory_id from order_inventory
    await queryInterface.removeColumn('order_inventory', 'inventory_id');

    // 4. Remove profile_id from order_profile
    await queryInterface.removeColumn('order_profile', 'profile_id');
  }
};
