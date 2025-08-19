import { DataTypes, Model } from 'sequelize'
import sequelize from '../db/sequelize.js'
import { nanoid } from 'nanoid'

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => nanoid(),
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    extraType: {
      type: DataTypes.STRING,
    },
    extraValue: {
      // Store serialized embed metadata (can exceed 255 chars)
      type: DataTypes.TEXT,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user whose profile/wall this post appears on',
    },
  },
  {
    sequelize,
    modelName: 'Post',
    timestamps: true,
  }
)

export default Post
