'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      material_type: {
        type: Sequelize.ENUM('CR-5', 'EN-9'),
        allowNull: false,
        comment: 'Type of material - must match enum_profiles_material'
      },
      material_weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Weight of material in kg'
      },
      cut_size_width: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Width dimension in mm'
      },
      cut_size_height: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Height dimension in mm'
      },
      po_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Related Purchase Order number'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity of items in inventory'
      },
      status: {
        type: Sequelize.ENUM('available', 'reserved', 'used', 'damaged'),
        allowNull: false,
        defaultValue: 'available',
        comment: 'Current status of inventory item'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Storage location or bin number'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes or remarks'
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

    // Add indexes for commonly queried fields
    await queryInterface.addIndex('inventory', ['material_type'], {
      name: 'idx_inventory_material_type'
    });
    
    await queryInterface.addIndex('inventory', ['status'], {
      name: 'idx_inventory_status'
    });
    
    await queryInterface.addIndex('inventory', ['po_number'], {
      name: 'idx_inventory_po_number'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
    // Note: ENUMs will be automatically dropped when the table is dropped
  }
};
