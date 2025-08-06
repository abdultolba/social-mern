const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db/sequelize')
const { nanoid } = require('nanoid')

class Post extends Model {}

Post.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  extraType: {
    type: DataTypes.STRING
  },
  extraValue: {
    type: DataTypes.STRING
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Post',
  timestamps: true
})

module.exports = Post
