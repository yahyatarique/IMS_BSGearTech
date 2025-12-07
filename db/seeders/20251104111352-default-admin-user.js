'use strict';

const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcryptjs.hash('admin123', 12);
    const saHashedPassword = await bcryptjs.hash('superAdmin007', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        id: queryInterface.sequelize.literal('gen_random_uuid()'),
        username: 'superAdmin007',
        password: saHashedPassword,
        role: '0',
        first_name: 'Super',
        last_name: 'Admin',
        created_at: new Date()
      },
      {
        id: queryInterface.sequelize.literal('gen_random_uuid()'),
        username: 'admin',
        password: hashedPassword,
        role: '1',
        first_name: 'Admin',
        last_name: 'User',
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['admin', 'superAdmin007']
    });
  }
};
