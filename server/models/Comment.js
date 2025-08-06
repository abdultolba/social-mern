const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/sequelize");
const { nanoid } = require("nanoid");

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => nanoid(),
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000], // Comments can be up to 1000 characters
      },
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ID of the post this comment belongs to",
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID of the user who wrote this comment",
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    timestamps: true,
  }
);

module.exports = Comment;
