'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a sequence for order numbers
    // Format: BSGPL/MM/YYYY/N where N increments monthly
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS order_number_seq 
      START 1 
      INCREMENT 1;
    `);

    // Create a function to generate the next order number
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION get_next_order_number()
      RETURNS TEXT AS $$
      DECLARE
        v_month TEXT;
        v_year TEXT;
        v_sequence INTEGER;
      BEGIN
        v_month := TO_CHAR(NOW(), 'MM');
        v_year := TO_CHAR(NOW(), 'YYYY');
        v_sequence := nextval('order_number_seq');
        RETURN 'BSGPL/' || v_month || '/' || v_year || '/' || LPAD(v_sequence::TEXT, 5, '0');
      END;
      $$ LANGUAGE plpgsql;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop function and sequence on rollback
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS get_next_order_number();
    `);

    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS order_number_seq;
    `);
  }
};
