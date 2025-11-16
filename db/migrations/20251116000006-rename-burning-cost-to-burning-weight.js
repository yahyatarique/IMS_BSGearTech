'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('profiles', 'burning_cost', 'burning_weight');
    await queryInterface.renameColumn('order_profile', 'burning_cost', 'burning_weight');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('profiles', 'burning_weight', 'burning_cost');
    await queryInterface.renameColumn('order_profile', 'burning_weight', 'burning_cost');
  }
};
