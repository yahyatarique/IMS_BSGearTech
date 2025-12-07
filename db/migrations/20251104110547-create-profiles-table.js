'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: false,
        comment: '0 = pinion, 1 = gear'
      },
      material: {
        type: Sequelize.ENUM('CR-5', 'EN-9'),
        allowNull: false
      },
      material_rate: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false
      },
      cut_size_width_mm: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false
      },
      cut_size_height_mm: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false
      },
      burning_wastage_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      heat_treatment_rate: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false
      },
      heat_treatment_inefficacy_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profiles');
  }
};
