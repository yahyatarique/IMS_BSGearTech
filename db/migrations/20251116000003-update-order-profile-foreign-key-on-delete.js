'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('order_profile', 'order_profile_profile_id_fkey');
    
    await queryInterface.addConstraint('order_profile', {
      fields: ['profile_id'],
      type: 'foreign key',
      name: 'order_profile_profile_id_fkey',
      references: {
        table: 'profiles',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('order_profile', 'order_profile_profile_id_fkey');
    
    await queryInterface.addConstraint('order_profile', {
      fields: ['profile_id'],
      type: 'foreign key',
      name: 'order_profile_profile_id_fkey',
      references: {
        table: 'profiles',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
};
