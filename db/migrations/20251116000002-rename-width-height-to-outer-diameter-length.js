'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('inventory', 'width', 'outer_diameter');
    await queryInterface.renameColumn('inventory', 'height', 'length');
    
    await queryInterface.renameColumn('order_inventory', 'width', 'outer_diameter');
    await queryInterface.renameColumn('order_inventory', 'height', 'length');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('inventory', 'outer_diameter', 'width');
    await queryInterface.renameColumn('inventory', 'length', 'height');
    
    await queryInterface.renameColumn('order_inventory', 'outer_diameter', 'width');
    await queryInterface.renameColumn('order_inventory', 'length', 'height');
  }
};
