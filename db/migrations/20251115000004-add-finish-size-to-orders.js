'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'finish_size_width', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'finish_size_height', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'finish_size_width');
    await queryInterface.removeColumn('orders', 'finish_size_height');
  }
};
