'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove foreign key constraint and user_id column from burning_wastage table
    await queryInterface.removeColumn('burning_wastage', 'user_id');
  },

  async down(queryInterface, Sequelize) {
    // Re-add user_id column if migration is rolled back
    await queryInterface.addColumn('burning_wastage', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who recorded the wastage',
    });

    await queryInterface.addIndex('burning_wastage', ['user_id']);
  },
};
