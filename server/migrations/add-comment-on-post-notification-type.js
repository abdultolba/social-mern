const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the enum value already exists
    const [results] = await queryInterface.sequelize.query(
      `SELECT unnest(enum_range(NULL::"enum_Notifications_type")) AS enum_value;`
    );
    
    const existingValues = results.map(row => row.enum_value);
    
    if (!existingValues.includes('comment_on_post')) {
      // Add the new enum value to the existing enum type
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_Notifications_type" ADD VALUE 'comment_on_post';`
      );
      console.log('Added comment_on_post notification type to enum');
    } else {
      console.log('comment_on_post notification type already exists in enum');
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // We would need to recreate the enum type and update the column
    // For now, we'll just log a warning
    console.log('Warning: Cannot remove enum value from PostgreSQL enum. Manual intervention required.');
  }
};
