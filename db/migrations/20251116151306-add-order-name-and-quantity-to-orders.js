'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'order_name', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'order_name');
    await queryInterface.removeColumn('orders', 'quantity');
  }
};
