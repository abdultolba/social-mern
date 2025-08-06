const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db/sequelize')

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  openProfile: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  profilePic: {
    type: DataTypes.STRING,
    defaultValue: () => `/images/avatars/default/avatar_default_${Math.floor((Math.random() * 5))}.png`
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true
})

module.exports = User
