'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'orders',
        'rate',
        {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
          defaultValue: 0
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const ordersColumns = await queryInterface.describeTable('orders');

      if (ordersColumns.rate) {
        await queryInterface.removeColumn('orders', 'rate', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
