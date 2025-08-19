const express = require("express");
const router = express.Router();
const { Comment, User, Post } = require("../models");
const { isAuth } = require("../middlewares/auth");
const { 
  createMentionNotifications, 
  createPostCommentNotification, 
  createCommentReplyNotification,
  createCommentLikeNotification,
  removeCommentLikeNotification
} = require("../utils/mentions");
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
    const { message, postId, parentCommentId } = req.body;

    try {
      // Verify the post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: "Post not found",
        });
      }

      let parentComment = null;
      // If this is a reply, verify the parent comment exists and belongs to the same post
      if (parentCommentId) {
        parentComment = await Comment.findByPk(parentCommentId, {
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "profilePic"],
            },
          ],
        });
        
        if (!parentComment) {
          return res.status(404).json({
            code: 404,
            message: "Parent comment not found",
          });
        }
        
        if (parentComment.postId !== postId) {
          return res.status(400).json({
            code: 400,
            message: "Parent comment must belong to the same post",
          });
        }
      }

      // Create the comment with user info included inline
      const comment = await Comment.create({
        message,
        postId,
        authorId: req.user.id,
        parentCommentId: parentCommentId || null,
      });

      // Get user info from the auth middleware instead of querying again
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "username", "profilePic"],
      });

      // Build response with author info and parent comment info
      const createdComment = {
        ...comment.toJSON(),
        author: {
          id: user.id,
          username: user.username,
          profilePic: user.profilePic,
        },
        // Include parent comment info if this is a reply
        parentComment: parentComment ? {
          id: parentComment.id,
          message: parentComment.message,
          author: {
            id: parentComment.author.id,
            username: parentComment.author.username,
            profilePic: parentComment.author.profilePic || null,
          },
        } : null,
      };

      // Create notifications for mentioned users (asynchronous, don't block response)
      createMentionNotifications(
        message,
        "mention_comment",
        req.user.id,
        postId,
        comment.id,
        user.username
      ).catch((error) => {
        console.error("Error creating mention notifications:", error);
      });

      // Create notification for post owner (asynchronous, don't block response)
      createPostCommentNotification(
        post.authorId,
        req.user.id,
        user.username,
        postId,
        comment.id
      ).catch((error) => {
        console.error("Error creating post owner notification:", error);
      });

      // If this is a reply to a comment, create notification for the original comment author
      if (parentComment) {
        createCommentReplyNotification(
          parentComment.authorId,
          req.user.id,
          user.username,
          postId,
          comment.id
        ).catch((error) => {
          console.error("Error creating comment reply notification:", error);
        });
      }

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

      // Fetch the comment with author info for the response
      const commentWithAuthor = await Comment.findByPk(id, {
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

      // Create notification for comment owner (asynchronous, don't block response)
      createCommentLikeNotification(
        commentWithAuthor.author.id,
        user.id,
        user.username,
        comment.postId,
        comment.id
      ).catch((error) => {
        console.error("Error creating comment like notification:", error);
      });

      res.status(200).json({ code: 200, response: commentWithAuthor });
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

      // Fetch the comment with author info for the response
      const commentWithAuthor = await Comment.findByPk(id, {
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

      // Remove notification for comment owner (asynchronous, don't block response)
      removeCommentLikeNotification(
        commentWithAuthor.author.id,
        user.id,
        comment.id
      ).catch((error) => {
        console.error("Error removing comment like notification:", error);
      });

      res.status(200).json({ code: 200, response: commentWithAuthor });
    } catch (err) {
      console.error("Error unliking comment:", err);
      res
        .status(500)
        .json({ error: "There was an error unliking the comment" });
    }
  }
);

module.exports = router;
