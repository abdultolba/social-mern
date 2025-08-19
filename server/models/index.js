import sequelize from '../db/sequelize.js'
import User from './User.js'
import Post from './Post.js'
import Comment from './Comment.js'
import Notification from './Notification.js'

// Set up associations
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
})

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
})

// Relationship for whose profile/wall the post appears on
User.hasMany(Post, {
  foreignKey: 'profileId',
  as: 'wallPosts',
})

Post.belongsTo(User, {
  foreignKey: 'profileId',
  as: 'profileOwner',
})

// Many-to-many relationship for likes
User.belongsToMany(Post, {
  through: 'PostLikes',
  foreignKey: 'userId',
  otherKey: 'postId',
  as: 'likedPosts',
  timestamps: false,
})

Post.belongsToMany(User, {
  through: 'PostLikes',
  foreignKey: 'postId',
  otherKey: 'userId',
  as: 'likedByUsers',
  timestamps: false,
})

// Comment associations
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
  onDelete: 'CASCADE',
})

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
})

User.hasMany(Comment, {
  foreignKey: 'authorId',
  as: 'comments',
})

Comment.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
})

// Many-to-many relationship for comment likes
User.belongsToMany(Comment, {
  through: 'CommentLikes',
  foreignKey: 'userId',
  otherKey: 'commentId',
  as: 'likedComments',
  timestamps: false,
})

Comment.belongsToMany(User, {
  through: 'CommentLikes',
  foreignKey: 'commentId',
  otherKey: 'userId',
  as: 'likedByUsers',
  timestamps: false,
})

// Self-referencing associations for threaded comments
Comment.hasMany(Comment, {
  foreignKey: 'parentCommentId',
  as: 'replies',
  onDelete: 'CASCADE',
})

Comment.belongsTo(Comment, {
  foreignKey: 'parentCommentId',
  as: 'parentComment',
})

// Notification associations
User.hasMany(Notification, {
  foreignKey: 'recipientId',
  as: 'receivedNotifications',
  onDelete: 'CASCADE',
})

User.hasMany(Notification, {
  foreignKey: 'senderId',
  as: 'sentNotifications',
  onDelete: 'CASCADE',
})

Notification.belongsTo(User, {
  foreignKey: 'recipientId',
  as: 'recipient',
})

Notification.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
})

// Optional associations for posts and comments
Notification.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'relatedPost',
})

Notification.belongsTo(Comment, {
  foreignKey: 'commentId',
  as: 'relatedComment',
})

export { sequelize, User, Post, Comment, Notification }
