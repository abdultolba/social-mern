import express from "express";
import { createRequire } from "module";
import { Post, User, Comment } from "../models/index.js";
const require = createRequire(import.meta.url);
const { isAuth } = require("../middlewares/auth").default;
const { processMessageForEmbed } = require("../services/linkPreview").default;
const { validatePostContent, rateLimit, validateContentSafety } =
  require("../middlewares/validation").default;
import { param, validationResult } from "express-validator";
import {
  createPostLikeNotification,
  removePostLikeNotification,
} from "../utils/mentions.js";
const router = express.Router();

// Validate post ID parameter
const validatePostId = [
  param("id")
    .notEmpty()
    .withMessage("Post ID is required")
    .isLength({ min: 1 })
    .withMessage("Post ID cannot be empty"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: "Invalid post ID",
        errors: errors.array(),
      });
    }
    next();
  },
];

// GET /api/post/:id
router.get("/:id", validatePostId, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePic"],
        },
        {
          model: Comment,
          as: "comments",
          required: false,
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
            {
              model: Comment,
              as: "parentComment",
              include: [
                {
                  model: User,
                  as: "author",
                  attributes: ["id", "username", "profilePic"],
                },
              ],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
        {
          model: User,
          as: "likedByUsers",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ code: 404, message: "Post not found" });
    }

    res.status(200).json({ code: 200, response: post });
  } catch (err) {
    res.status(500).json({ error: "An unknown error occurred." });
  }
});

// PATCH /api/post/:id
router.patch(
  "/:id",
  validatePostId,
  isAuth,
  rateLimit(3, 5 * 60 * 1000), // 3 edits per 5 minutes
  validatePostContent,
  validateContentSafety,
  async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    try {
      const post = await Post.findOne({ where: { id, authorId: req.user.id } });

      if (!post) {
        return res.status(404).json({
          code: 404,
          message: "Post not found or you are not the author.",
        });
      }

      // Update message
      post.message = message;

      // Re-process embedded links for the updated message
      const embedData = await processMessageForEmbed(message);
      if (embedData) {
        post.extraType = embedData.type;
        post.extraValue = JSON.stringify(embedData);
      } else {
        // Clear embed data if no URLs found
        post.extraType = null;
        post.extraValue = null;
      }

      await post.save();

      res.status(200).json({
        code: 200,
        message: "Post successfully updated!",
        response: post,
      });
    } catch (err) {
      res.status(500).send("Your post couldn't be updated.");
    }
  }
);

// DELETE /api/post/:id
router.delete("/:id", validatePostId, isAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findOne({ where: { id, authorId: req.user.id } });

    if (!post) {
      return res.status(404).json({
        code: 404,
        message: "Post not found or you are not the author.",
      });
    }

    await post.destroy();

    res
      .status(200)
      .json({ code: 200, message: "Post deleted", deletedPost: post });
  } catch (err) {
    res
      .status(500)
      .json({ code: 500, message: "There was an error deleting the post" });
  }
});

// POST /api/post/:id/like
router.post(
  "/:id/like",
  validatePostId,
  isAuth,
  rateLimit(20, 60 * 1000), // 20 likes per minute
  async (req, res) => {
    const { id } = req.params;

    try {
      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username"],
          },
        ],
      });

      if (!post) {
        return res.status(404).json({ code: 404, message: "Post not found" });
      }

      const user = await User.findByPk(req.user.id);

      // Check if the user has already liked the post
      const hasLiked = await post.hasLikedByUser(user);
      if (hasLiked) {
        return res
          .status(403)
          .json({ code: 403, response: "You already liked this post" });
      }

      await post.addLikedByUser(user);
      post.likes = await post.countLikedByUsers();
      await post.save();

      // Create notification for post owner (asynchronous, don't block response)
      createPostLikeNotification(
        post.author.id,
        user.id,
        user.username,
        post.id
      ).catch((error) => {
        console.error("Error creating post like notification:", error);
      });

      // Return optimized response without additional query
      // Include the user who just liked the post
      const responsePost = {
        ...post.toJSON(),
        likedByUsers: [
          ...(post.likedByUsers || []),
          {
            id: user.id,
            username: user.username,
          },
        ],
      };

      res.status(200).json({ code: 200, response: responsePost });
    } catch (err) {
      res.status(500).send("There was an error");
    }
  }
);

// POST /api/post/:id/unlike
router.post(
  "/:id/unlike",
  validatePostId,
  isAuth,
  rateLimit(20, 60 * 1000), // 20 unlikes per minute
  async (req, res) => {
    const { id } = req.params;

    try {
      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username"],
          },
        ],
      });

      if (!post) {
        return res.status(404).json({ code: 404, message: "Post not found" });
      }

      const user = await User.findByPk(req.user.id);

      // Check if the user has liked the post
      const hasLiked = await post.hasLikedByUser(user);
      if (!hasLiked) {
        return res
          .status(403)
          .json({ code: 403, response: "You haven't liked this post yet" });
      }

      await post.removeLikedByUser(user);
      post.likes = await post.countLikedByUsers();
      await post.save();

      // Remove notification for post owner (asynchronous, don't block response)
      removePostLikeNotification(post.author.id, user.id, post.id).catch(
        (error) => {
          console.error("Error removing post like notification:", error);
        }
      );

      // Return optimized response without additional query
      // Remove the user who just unliked the post from the current likes
      const responsePost = {
        ...post.toJSON(),
        likedByUsers: (post.likedByUsers || []).filter(
          (likedUser) => likedUser.id !== user.id
        ),
      };

      res.status(200).json({ code: 200, response: responsePost });
    } catch (err) {
      res.status(500).send("There was an error");
    }
  }
);

export default router;
