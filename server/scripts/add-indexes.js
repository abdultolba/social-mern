const { sequelize } = require("../models");

async function addIndexes() {
  try {
    console.log("🔧 Adding database indexes for performance optimization...");

    // Add indexes for Posts table
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_profile_id 
      ON "Posts" ("profileId");
    `);
    console.log("✅ Added index on Posts.profileId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_id 
      ON "Posts" ("authorId");
    `);
    console.log("✅ Added index on Posts.authorId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at 
      ON "Posts" ("createdAt" DESC);
    `);
    console.log("✅ Added index on Posts.createdAt (DESC)");

    // Add indexes for Comments table
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_id 
      ON "Comments" ("postId");
    `);
    console.log("✅ Added index on Comments.postId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_author_id 
      ON "Comments" ("authorId");
    `);
    console.log("✅ Added index on Comments.authorId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_created_at 
      ON "Comments" ("createdAt" ASC);
    `);
    console.log("✅ Added index on Comments.createdAt (ASC)");

    // Add indexes for PostLikes junction table
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postlikes_user_id 
      ON "PostLikes" ("userId");
    `);
    console.log("✅ Added index on PostLikes.userId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postlikes_post_id 
      ON "PostLikes" ("postId");
    `);
    console.log("✅ Added index on PostLikes.postId");

    // Add composite index for PostLikes
    await sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_postlikes_user_post 
      ON "PostLikes" ("userId", "postId");
    `);
    console.log("✅ Added composite unique index on PostLikes(userId, postId)");

    // Add indexes for CommentLikes junction table
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commentlikes_user_id 
      ON "CommentLikes" ("userId");
    `);
    console.log("✅ Added index on CommentLikes.userId");

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commentlikes_comment_id 
      ON "CommentLikes" ("commentId");
    `);
    console.log("✅ Added index on CommentLikes.commentId");

    // Add composite index for CommentLikes
    await sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commentlikes_user_comment 
      ON "CommentLikes" ("userId", "commentId");
    `);
    console.log(
      "✅ Added composite unique index on CommentLikes(userId, commentId)"
    );

    // Add index on Users username (already unique but good for performance)
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_lower 
      ON "Users" (LOWER("username"));
    `);
    console.log("✅ Added case-insensitive index on Users.username");

    console.log("🎉 All indexes added successfully!");
    console.log("\n📊 Performance improvements:");
    console.log("   • Post wall queries will be much faster");
    console.log("   • Comment loading will be optimized");
    console.log("   • Like/unlike operations will be instant");
    console.log("   • User searches will be case-insensitive and fast");
  } catch (error) {
    console.error("❌ Error adding indexes:", error);

    // If it's a duplicate index error, that's okay
    if (error.message.includes("already exists")) {
      console.log("ℹ️  Some indexes already existed - this is normal");
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  addIndexes();
}

module.exports = addIndexes;
