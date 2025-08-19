const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/sequelize");
const { nanoid } = require("nanoid");

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => nanoid(),
    },
    type: {
      type: DataTypes.ENUM("mention_post", "mention_comment", "comment_on_post", "comment_reply", "post_like", "comment_like"),
      allowNull: false,
      comment: "Type of notification - mention, comment, reply, or like",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Notification message text",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether the notification has been read",
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID of the user receiving the notification",
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID of the user who triggered the notification",
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID of the related post (if applicable)",
    },
    commentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID of the related comment (if applicable)",
    },
  },
  {
    sequelize,
    modelName: "Notification",
    timestamps: true,
    indexes: [
      {
        fields: ["recipientId", "createdAt"],
      },
      {
        fields: ["isRead"],
      },
    ],
  }
);

module.exports = Notification;
