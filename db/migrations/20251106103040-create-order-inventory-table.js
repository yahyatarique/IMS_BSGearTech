'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_inventory', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to the order'
      },
      inventory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'inventory',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Reference to the inventory item'
      },
      quantity_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity of inventory items used for this order'
      },
      weight_used: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: 'Actual weight used in kg (if different from full item)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes about usage'
      },
      reserved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when inventory was reserved for this order'
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when inventory was actually used'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for foreign keys
    await queryInterface.addIndex('order_inventory', ['order_id'], {
      name: 'idx_order_inventory_order_id'
    });
    
    await queryInterface.addIndex('order_inventory', ['inventory_id'], {
      name: 'idx_order_inventory_inventory_id'
    });

    // Add composite unique index to prevent duplicate entries
    await queryInterface.addIndex('order_inventory', ['order_id', 'inventory_id'], {
      name: 'idx_order_inventory_unique',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_inventory');
  }
};
