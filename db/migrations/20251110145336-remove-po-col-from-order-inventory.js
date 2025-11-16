'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('order_inventory');
    if (tableDescription.po_number) {
      await queryInterface.removeColumn('order_inventory', 'po_number');
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('order_inventory');
    if (!tableDescription.po_number) {
      await queryInterface.addColumn('order_inventory', 'po_number', { type: Sequelize.STRING });
    }
  }
};
