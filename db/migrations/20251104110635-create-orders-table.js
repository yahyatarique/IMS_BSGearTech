'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      order_number: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('0', '1', '2'),
        allowNull: false,
        defaultValue: '0',
        comment: 'Pending = 0, Accepted = 1, Completed = 2'
      },
      grand_total: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      material_cost: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      process_costs: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      turning_rate: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      teeth_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      module: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      },
      face: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      ht_cost: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_order_value: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      profit_margin: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('orders', ['buyer_id'], { name: 'idx_orders_buyer_id' });
    await queryInterface.addIndex('orders', ['order_number']);
    await queryInterface.addIndex('orders', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
