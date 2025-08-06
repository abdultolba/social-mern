const sequelize = require("../db/sequelize");
const User = require("./User");
const Post = require("./Post");
const Comment = require("./Comment");

// Set up associations
User.hasMany(Post, {
  foreignKey: "authorId",
  as: "posts",
});

Post.belongsTo(User, {
  foreignKey: "authorId",
  as: "author",
});

// Relationship for whose profile/wall the post appears on
User.hasMany(Post, {
  foreignKey: "profileId",
  as: "wallPosts",
});

Post.belongsTo(User, {
  foreignKey: "profileId",
  as: "profileOwner",
});

// Many-to-many relationship for likes
User.belongsToMany(Post, {
  through: "PostLikes",
  foreignKey: "userId",
  otherKey: "postId",
  as: "likedPosts",
  timestamps: false,
});

Post.belongsToMany(User, {
  through: "PostLikes",
  foreignKey: "postId",
  otherKey: "userId",
  as: "likedByUsers",
  timestamps: false,
});

// Comment associations
Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comments",
  onDelete: "CASCADE",
});

Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

User.hasMany(Comment, {
  foreignKey: "authorId",
  as: "comments",
});

Comment.belongsTo(User, {
  foreignKey: "authorId",
  as: "author",
});

// Many-to-many relationship for comment likes
User.belongsToMany(Comment, {
  through: "CommentLikes",
  foreignKey: "userId",
  otherKey: "commentId",
  as: "likedComments",
  timestamps: false,
});

Comment.belongsToMany(User, {
  through: "CommentLikes",
  foreignKey: "commentId",
  otherKey: "userId",
  as: "likedByUsers",
  timestamps: false,
});

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
};
