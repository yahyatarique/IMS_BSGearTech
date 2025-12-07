'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove indexes that rely on profile_id (they will automatically drop with the column in Postgres,
      // but we remove them explicitly for portability).
      await queryInterface.removeIndex('order_profile', ['order_id', 'profile_id'], { transaction }).catch(() => {});
      await queryInterface.removeIndex('order_profile', ['profile_id'], { transaction }).catch(() => {});

      await queryInterface.removeColumn('order_profile', 'profile_id', { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('order_profile', 'profile_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Foreign key to profiles table',
      }, { transaction });

      await queryInterface.addIndex('order_profile', ['profile_id'], { transaction });
      await queryInterface.addIndex('order_profile', ['order_id', 'profile_id'], { transaction });
    });
  }
};
