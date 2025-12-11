'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add '3' (SUPE_OPS) to the enum_users_role type
      await queryInterface.sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE '3';`);
    } catch (error) {
      // Ignore error if value already exists
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Postgres doesn't support removing values from enums easily
    // We would need to rename the type, create a new one, convert columns, and drop the old type
    // For adding a role, it's generally safe to leave it in the type even if unused
  }
};
