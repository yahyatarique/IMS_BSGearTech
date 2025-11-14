'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('order_sequence', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          defaultValue: 1
        },
        current_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Insert initial record
      await queryInterface.bulkInsert('order_sequence', [{
        id: 1,
        current_number: 0,
        updated_at: new Date()
      }], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('order_sequence', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
