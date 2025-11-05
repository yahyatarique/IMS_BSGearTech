'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for orders.buyer_id -> buyer.id
    await queryInterface.addConstraint('orders', {
      fields: ['buyer_id'],
      type: 'foreign key',
      name: 'orders_buyer_id_fk',
      references: {
        table: 'buyer',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add foreign key constraint for orders.user_id -> users.id
    await queryInterface.addConstraint('orders', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'orders_user_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('orders', 'orders_user_id_fk');
    await queryInterface.removeConstraint('orders', 'orders_buyer_id_fk');
  }
};
