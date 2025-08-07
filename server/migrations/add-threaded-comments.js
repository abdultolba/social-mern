const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if parentCommentId column exists
    const tableDesc = await queryInterface.describeTable('Comments');
    if (!tableDesc.parentCommentId) {
      await queryInterface.addColumn('Comments', 'parentCommentId', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID of the parent comment if this is a reply (null for top-level comments)',
      });
      console.log('Added parentCommentId column to Comments table');
    } else {
      console.log('parentCommentId column already exists in Comments table');
    }

    // Check if foreign key constraint exists
    try {
      await queryInterface.addConstraint('Comments', {
        fields: ['parentCommentId'],
        type: 'foreign key',
        name: 'fk_comments_parent_comment',
        references: {
          table: 'Comments',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      console.log('Added foreign key constraint for parentCommentId');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Foreign key constraint already exists');
      } else {
        throw error;
      }
    }

    // Add the comment_reply enum value if it doesn't exist
    const [results] = await queryInterface.sequelize.query(
      `SELECT unnest(enum_range(NULL::"enum_Notifications_type")) AS enum_value;`
    );
    
    const existingValues = results.map(row => row.enum_value);
    
    if (!existingValues.includes('comment_reply')) {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_Notifications_type" ADD VALUE 'comment_reply';`
      );
      console.log('Added comment_reply notification type to enum');
    } else {
      console.log('comment_reply notification type already exists in enum');
    }

    console.log('Added threaded comments support and notification types');
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint
    await queryInterface.removeConstraint('Comments', 'fk_comments_parent_comment');

    // Remove parentCommentId column from Comments table
    await queryInterface.removeColumn('Comments', 'parentCommentId');

    // Note: PostgreSQL doesn't support removing enum values directly
    // We would need to recreate the enum type and update the column
    // For now, we'll just log a warning
    console.log('Warning: Cannot remove enum values from PostgreSQL enum. Manual intervention required.');

    console.log('Removed threaded comments support and reverted notification types');
  }
};
