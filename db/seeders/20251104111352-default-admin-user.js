'use strict';

const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcryptjs.hash('admin123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        id: queryInterface.sequelize.literal('gen_random_uuid()'),
        username: 'admin',
        password: hashedPassword,
        role: '0',
        first_name: 'System',
        last_name: 'Administrator',
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      username: 'admin'
    });
  }
};
