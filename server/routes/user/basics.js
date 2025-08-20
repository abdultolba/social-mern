import express from "express";
import { User, Post, Comment } from "../../models/index.js";
import { createMentionNotifications } from "../../utils/mentions.js";
import Auth from "../../middlewares/auth.js";
import LinkPreview from "../../services/linkPreview.js";
import Validation from "../../middlewares/validation.js";
import jwt from 'jsonwebtoken'
const { isAuth } = Auth;
const { processMessageForEmbed } = LinkPreview;
const {
  validatePostContent,
  validateUsername,
  validateWallPostPermission,
  validateContentSafety,
  validateUserExists,
  validateViewPermission,
  rateLimit,
} = Validation;
const router = express.Router();

router.get(
  "/:username",
  validateUsername,
  validateUserExists,
  async (req, res) => {
    try {
      // User data is already validated and available from middleware
      const user = req.targetUser;

      // Count posts authored by this user
      const authoredPosts = await Post.count({ where: { authorId: user.id } });
      // Count posts on this user's wall/profile
      const wallPosts = await Post.count({ where: { profileId: user.id } });

      // Count likes received by this user's posts
      const userPosts = await Post.findAll({
        where: { authorId: user.id },
        include: [
          {
            model: User,
            as: "likedByUsers",
            attributes: ["id"],
          },
        ],
      });

      // Sum up all likes across all posts
      const likes = userPosts.reduce((total, post) => {
        return total + (post.likedByUsers ? post.likedByUsers.length : 0);
      }, 0);

      res.status(200).json({
        code: 200,
        response: {
          posts: wallPosts, // Show wall posts count in profile
          authoredPosts, // Also include authored posts count
          likes,
          ...user.toJSON(),
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ code: 500, error: "There was an error." });
    }
  }
);

router.get(
  "/:username/posts",
  validateUsername,
  validateUserExists,
  validateViewPermission,
  async (req, res) => {
    try {
      // User data is already validated and available from middleware
      const user = req.targetUser;

      // Get current user from auth header (optional for guests)
      let currentUser = null;
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          currentUser = await User.findByPk(decoded.data.id);
        } catch (err) {
          // Invalid token, continue as guest
        }
      }

      // Find all posts on this user's wall/profile (by profileId, not authorId)
      const posts = await Post.findAll({
        where: { profileId: user.id },
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
            as: "comments",
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
            order: [["createdAt", "ASC"]],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Add liked status for current user
      const postsWithLikeStatus = posts.map((post) => {
        const postData = post.toJSON();
        postData.liked = currentUser
          ? postData.likedByUsers.some((user) => user.id === currentUser.id)
          : false;
        return postData;
      });

      res.status(200).json({
        code: 200,
        response: postsWithLikeStatus,
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ code: 500, error: "There was an error" });
    }
  }
);

router.get(
  "/:username/likes",
  validateUsername,
  validateUserExists,
  validateViewPermission,
  async (req, res) => {
    try {
      // User data is already validated and available from middleware
      const user = req.targetUser;

      // Find posts liked by this user using the many-to-many relationship
      const likedPosts = await user.getLikedPosts({
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "profilePic"],
          },
          {
            model: Comment,
            as: "comments",
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
            order: [["createdAt", "ASC"]],
          },
        ],
        limit: 2,
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        code: 200,
        response: likedPosts,
      });
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      res.status(500).json({ code: 500, error: "There was an error" });
    }
  }
);

router.post(
  "/:username/new/post",
  validateUsername,
  isAuth,
  rateLimit(5, 10 * 60 * 1000), // 5 posts per 10 minutes
  validatePostContent,
  validateContentSafety,
  validateWallPostPermission,
  async (req, res) => {
    const { message } = req.body;
    let { extra = null } = req.body;
    const authorId = req.user.id;

    // Profile owner data is already validated and available from middleware
    const profileId = req.profileOwner.id;

    try {
      // Process the extra data if provided, or check for embedded links
      let extraType = null;
      let extraValue = null;

      if (extra && extra.value && extra.extraType) {
        extraType = extra.extraType;
        extraValue = extra.value.includes("=")
          ? extra.value.split("=")[1]
          : extra.value;
      } else {
        // Auto-detect and process embedded links
        const embedData = await processMessageForEmbed(message);

        if (embedData) {
          extraType = embedData.type;
          extraValue = JSON.stringify(embedData);
        }
      }

      const newPost = await Post.create({
        message,
        authorId,
        profileId,
        extraType,
        extraValue,
      });

      // Fetch the post with author information
      const populatedPost = await Post.findByPk(newPost.id, {
        include: {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePic"],
        },
      });

      // Create notifications for mentioned users (asynchronous, don't block response)
      createMentionNotifications(
        message,
        "mention_post",
        authorId,
        newPost.id,
        null,
        req.user.username
      ).catch((error) => {
        console.error("Error creating mention notifications:", error);
      });

      res.status(201).json({
        code: 201,
        response: populatedPost,
      });
    } catch (err) {
      console.error("Post creation error:", err);
      res
        .status(500)
        .json({ code: 500, message: "We couldn't save your post." });
    }
  }
);

export default router;
