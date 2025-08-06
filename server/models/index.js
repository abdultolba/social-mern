const sequelize = require('../db/sequelize')
const User = require('./User')
const Post = require('./Post')

// Set up associations
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts'
})

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
})

// Many-to-many relationship for likes
User.belongsToMany(Post, {
  through: 'PostLikes',
  foreignKey: 'userId',
  otherKey: 'postId',
  as: 'likedPosts',
  timestamps: false
})

Post.belongsToMany(User, {
  through: 'PostLikes',
  foreignKey: 'postId',
  otherKey: 'userId',
  as: 'likedByUsers',
  timestamps: false
})

module.exports = {
  sequelize,
  User,
  Post
}
