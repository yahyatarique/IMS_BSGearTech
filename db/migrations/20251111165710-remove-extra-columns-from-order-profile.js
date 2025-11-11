'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_profile', 'quantity');
    await queryInterface.removeColumn('order_profile', 'unit_price');
    await queryInterface.removeColumn('order_profile', 'total_price');
    await queryInterface.removeColumn('order_profile', 'profile_snapshot');
    await queryInterface.removeColumn('order_profile', 'notes');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('order_profile', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
    await queryInterface.addColumn('order_profile', 'unit_price', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false
    });
    await queryInterface.addColumn('order_profile', 'total_price', {
      type: Sequelize.DECIMAL(14, 2),
      allowNull: false
    });
    await queryInterface.addColumn('order_profile', 'profile_snapshot', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    });
    await queryInterface.addColumn('order_profile', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
