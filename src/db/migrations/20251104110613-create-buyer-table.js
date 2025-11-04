'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('buyer', {
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
      contact_details: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      gst_number: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pan_number: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tin_number: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      org_name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      org_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('buyer');
  }
};
