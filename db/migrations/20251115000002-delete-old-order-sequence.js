'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS get_next_order_number();', { transaction });
      await queryInterface.sequelize.query('DROP SEQUENCE IF EXISTS order_number_seq;', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS order_number_seq 
        START 1 
        INCREMENT 1;
      `, { transaction });

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
      `, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
