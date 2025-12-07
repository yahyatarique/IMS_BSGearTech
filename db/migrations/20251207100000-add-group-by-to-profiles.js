'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add groupBy column to profiles table
    // await queryInterface.addColumn('profiles', 'group_by', {
    //   type: Sequelize.STRING(100),
    //   allowNull: true,
    //   comment: 'Group identifier or key for the profile',
    // });

    // Add groupBy column to order_profiles table
    await queryInterface.addColumn('order_profile', 'group_by', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Group identifier or key for the order profile',
    });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('profiles', 'group_by');
    await queryInterface.removeColumn('order_profiles', 'group_by');
  },
};
