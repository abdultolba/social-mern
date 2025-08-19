'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new notification types to the existing enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'post_like';
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'comment_like';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // In a real scenario, you might need to recreate the enum or handle this differently
    console.log('Warning: Cannot directly remove enum values in PostgreSQL. Manual cleanup may be required.');
  }
};
