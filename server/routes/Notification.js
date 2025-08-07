const express = require("express");
const router = express.Router();
const { Notification, User, Post, Comment } = require("../models");
const { isAuth } = require("../middlewares/auth");
const { param, validationResult } = require("express-validator");

// Validate notification ID parameter
const validateNotificationId = [
  param("id")
    .notEmpty()
    .withMessage("Notification ID is required")
    .isLength({ min: 1 })
    .withMessage("Notification ID cannot be empty"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid notification ID",
        errors: errors.array(),
      });
    }
    next();
  },
];

// GET /api/notifications - Get all notifications for the current user
router.get("/", isAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findAndCountAll({
      where: {
        recipientId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "profilePic"],
        },
        {
          model: Post,
          as: "relatedPost",
          attributes: ["id", "message"],
          required: false,
        },
        {
          model: Comment,
          as: "relatedComment",
          attributes: ["id", "message"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(notifications.count / limit);

    res.status(200).json({
      code: 200,
      response: {
        notifications: notifications.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: notifications.count,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching notifications",
    });
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get("/unread-count", isAuth, async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: {
        recipientId: req.user.id,
        isRead: false,
      },
    });

    res.status(200).json({
      code: 200,
      response: { unreadCount },
    });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching unread notifications count",
    });
  }
});

// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch("/:id/read", validateNotificationId, isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({
      where: {
        id,
        recipientId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        code: 404,
        message: "Notification not found",
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({
      code: 200,
      message: "Notification marked as read",
      response: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      code: 500,
      message: "Error updating notification",
    });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch("/mark-all-read", isAuth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          recipientId: req.user.id,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      code: 200,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      code: 500,
      message: "Error updating notifications",
    });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", validateNotificationId, isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({
      where: {
        id,
        recipientId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        code: 404,
        message: "Notification not found",
      });
    }

    await notification.destroy();

    res.status(200).json({
      code: 200,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      code: 500,
      message: "Error deleting notification",
    });
  }
});

module.exports = router;
