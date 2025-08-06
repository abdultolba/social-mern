const express = require("express");
const router = express.Router();
const { Comment, User, Post } = require("../models");
const { isAuth } = require("../middlewares/auth");
const { param, body, validationResult } = require("express-validator");
const {
  rateLimit,
  validateContentSafety,
} = require("../middlewares/validation");

// Validate comment ID parameter
const validateCommentId = [
  param("id")
    .notEmpty()
    .withMessage("Comment ID is required")
    .isLength({ min: 1 })
    .withMessage("Comment ID cannot be empty"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid comment ID",
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validate comment content
const validateCommentContent = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Comment message is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid comment content",
        errors: errors.array(),
      });
    }
    next();
  },
];

// GET /api/comment/:id - Get a specific comment
router.get("/:id", validateCommentId, async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePic"],
        },
        {
          model: User,
          as: "likedByUsers",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!comment) {
      return res.status(404).json({ code: 404, message: "Comment not found" });
    }

    res.status(200).json({ code: 200, response: comment });
  } catch (err) {
    console.error("Error fetching comment:", err);
    res.status(500).json({ error: "An unknown error occurred." });
  }
});

// POST /api/comment - Create a new comment
router.post(
  "/",
  isAuth,
  rateLimit(10, 60 * 1000), // 10 comments per minute
  validateCommentContent,
  validateContentSafety,
  async (req, res) => {
    const { message, postId } = req.body;

    try {
      // Verify the post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: "Post not found",
        });
      }

      // Create the comment
      const comment = await Comment.create({
        message,
        postId,
        authorId: req.user.id,
      });

      // Fetch the created comment with author info
      const createdComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "profilePic"],
          },
        ],
      });

      res.status(201).json({
        code: 201,
        message: "Comment created successfully",
        response: createdComment,
      });
    } catch (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ error: "Failed to create comment" });
    }
  }
);

// PATCH /api/comment/:id - Update a comment
router.patch(
  "/:id",
  validateCommentId,
  isAuth,
  rateLimit(5, 5 * 60 * 1000), // 5 edits per 5 minutes
  validateCommentContent,
  validateContentSafety,
  async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    try {
      const comment = await Comment.findOne({
        where: { id, authorId: req.user.id },
      });

      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: "Comment not found or you are not the author.",
        });
      }

      comment.message = message;
      await comment.save();

      // Fetch updated comment with author info
      const updatedComment = await Comment.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "profilePic"],
          },
        ],
      });

      res.status(200).json({
        code: 200,
        message: "Comment successfully updated!",
        response: updatedComment,
      });
    } catch (err) {
      console.error("Error updating comment:", err);
      res.status(500).json({ error: "Failed to update comment" });
    }
  }
);

// DELETE /api/comment/:id - Delete a comment
router.delete("/:id", validateCommentId, isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findOne({
      where: { id, authorId: req.user.id },
    });

    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: "Comment not found or you are not the author.",
      });
    }

    await comment.destroy();

    res.status(200).json({
      code: 200,
      message: "Comment deleted",
      deletedComment: comment,
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({
      code: 500,
      message: "There was an error deleting the comment",
    });
  }
});

// POST /api/comment/:id/like - Like a comment
router.post(
  "/:id/like",
  validateCommentId,
  isAuth,
  rateLimit(30, 60 * 1000), // 30 likes per minute
  async (req, res) => {
    const { id } = req.params;

    try {
      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res
          .status(404)
          .json({ code: 404, message: "Comment not found" });
      }

      const user = await User.findByPk(req.user.id);

      // Check if the user has already liked the comment
      const hasLiked = await comment.hasLikedByUser(user);
      if (hasLiked) {
        return res.status(403).json({
          code: 403,
          response: "You already liked this comment",
        });
      }

      await comment.addLikedByUser(user);
      comment.likes = await comment.countLikedByUsers();
      await comment.save();

      // Fetch the updated comment with all associations
      const updatedComment = await Comment.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "profilePic"],
          },
          {
            model: User,
            as: "likedByUsers",
            attributes: ["id", "username"],
          },
        ],
      });

      res.status(200).json({ code: 200, response: updatedComment });
    } catch (err) {
      console.error("Error liking comment:", err);
      res.status(500).json({ error: "There was an error liking the comment" });
    }
  }
);

// POST /api/comment/:id/unlike - Unlike a comment
router.post(
  "/:id/unlike",
  validateCommentId,
  isAuth,
  rateLimit(30, 60 * 1000), // 30 unlikes per minute
  async (req, res) => {
    const { id } = req.params;

    try {
      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res
          .status(404)
          .json({ code: 404, message: "Comment not found" });
      }

      const user = await User.findByPk(req.user.id);

      // Check if the user has liked the comment
      const hasLiked = await comment.hasLikedByUser(user);
      if (!hasLiked) {
        return res.status(403).json({
          code: 403,
          response: "You haven't liked this comment yet",
        });
      }

      await comment.removeLikedByUser(user);
      comment.likes = await comment.countLikedByUsers();
      await comment.save();

      // Fetch the updated comment with all associations
      const updatedComment = await Comment.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "profilePic"],
          },
          {
            model: User,
            as: "likedByUsers",
            attributes: ["id", "username"],
          },
        ],
      });

      res.status(200).json({ code: 200, response: updatedComment });
    } catch (err) {
      console.error("Error unliking comment:", err);
      res
        .status(500)
        .json({ error: "There was an error unliking the comment" });
    }
  }
);

module.exports = router;
