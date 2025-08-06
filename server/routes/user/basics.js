const express = require("express");
const router = express.Router();

const { User, Post } = require("../../models");

const { isAuth } = require("../../middlewares/auth");
const { processMessageForEmbed } = require("../../services/linkPreview");

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const normalizedUsername = username.toLowerCase();

    const user = await User.findOne({
      where: { username: normalizedUsername },
    });
    if (!user) {
      return res.status(404).json({ code: 404, response: "User not found" });
    }

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
});

router.get("/:username/posts", async (req, res) => {
  try {
    const { username: profile } = req.params;

    // Get current user from auth header (optional)
    let currentUser = null;
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        currentUser = await User.findByPk(decoded.data.id);
      } catch (err) {
        // Invalid token, continue as guest
      }
    }

    // Find the user first
    const normalizedProfile = profile.toLowerCase();
    const user = await User.findOne({ where: { username: normalizedProfile } });
    if (!user) {
      return res.status(404).json({ code: 404, response: "User not found" });
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
});

router.get("/:username/likes", async (req, res) => {
  try {
    const { username } = req.params;
    const normalizedUsername = username.toLowerCase();

    // Find the user first
    const user = await User.findOne({
      where: { username: normalizedUsername },
    });
    if (!user) {
      return res.status(404).json({ code: 404, response: "User not found" });
    }

    // Find posts liked by this user using the many-to-many relationship
    const likedPosts = await user.getLikedPosts({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePic"],
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
});

router.post("/:username/new/post", isAuth, async (req, res) => {
  const { message } = req.body;
  let { extra = null } = req.body;
  const { username } = req.params;
  const authorId = req.user.id;

  if (!message) {
    return res.status(400).json({ code: 400, message: "Message is required" });
  }

  try {
    // Find the profile owner (whose wall we're posting on)
    const normalizedUsername = username.toLowerCase();
    const profileOwner = await User.findOne({
      where: { username: normalizedUsername },
    });
    if (!profileOwner) {
      return res.status(404).json({ code: 404, message: "Profile not found" });
    }
    const profileId = profileOwner.id;
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

    res.status(201).json({
      code: 201,
      response: populatedPost,
    });
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ code: 500, message: "We couldn't save your post." });
  }
});

module.exports = router;
