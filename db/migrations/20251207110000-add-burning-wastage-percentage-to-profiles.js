'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('profiles', 'burning_wastage_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Burning wastage percentage for the profile'
    });

    await queryInterface.addColumn('order_profile', 'burning_wastage_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Burning wastage percentage for the order profile'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('profiles', 'burning_wastage_percentage');
    await queryInterface.removeColumn('order_profiles', 'burning_wastage_percentage');
  }
};
