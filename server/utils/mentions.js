const { User, Notification } = require("../models");

/**
 * Extract usernames from text that are mentioned with @ symbol
 * @param {string} text - The text to extract mentions from
 * @returns {Array<string>} - Array of usernames (without @ symbol)
 */
function extractMentions(text) {
  if (!text) return [];

  // Remove URLs and emails to avoid false positives like /@username in links
  const withoutUrls = text
    // strip http/https URLs
    .replace(/https?:\/\/[^\s)]+/gi, " ")
    // strip www. URLs
    .replace(/\bwww\.[^\s)]+/gi, " ")
    // strip emails
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, " ");

  // Match mentions only when preceded by start or whitespace
  // capture the leading whitespace so we can ignore it when extracting
  const mentionRegex = /(\s|^)@([a-zA-Z0-9_-]{3,30})\b/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(withoutUrls)) !== null) {
    const username = match[2].toLowerCase();
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }

  return mentions;
}

/**
 * Create notifications for users mentioned in a post or comment
 * @param {string} text - The text containing mentions
 * @param {string} type - Type of mention ('mention_post' or 'mention_comment')
 * @param {number} senderId - ID of the user creating the mention
 * @param {string} postId - ID of the related post
 * @param {string} commentId - ID of the related comment (optional)
 * @param {string} senderUsername - Username of the sender for notification message
 */
async function createMentionNotifications(
  text,
  type,
  senderId,
  postId,
  commentId = null,
  senderUsername = null
) {
  try {
    const mentionedUsernames = extractMentions(text);

    if (mentionedUsernames.length === 0) {
      return;
    }

    // Find all mentioned users
    const mentionedUsers = await User.findAll({
      where: {
        username: mentionedUsernames,
      },
      attributes: ["id", "username"],
    });

    // Create notifications for each mentioned user (except the sender)
    const notifications = mentionedUsers
      .filter((user) => user.id !== senderId) // Don't notify yourself
      .map((user) => {
        const message =
          type === "mention_post"
            ? `${senderUsername || "Someone"} mentioned you in a post`
            : `${senderUsername || "Someone"} mentioned you in a comment`;

        return {
          type,
          message,
          recipientId: user.id,
          senderId,
          postId,
          commentId,
        };
      });

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }

    return notifications.length;
  } catch (error) {
    console.error("Error creating mention notifications:", error);
    throw error;
  }
}

/**
 * Create notification for post owner when someone comments on their post
 * @param {number} postOwnerId - ID of the post owner
 * @param {number} commenterId - ID of the user commenting
 * @param {string} commenterUsername - Username of the commenter
 * @param {string} postId - ID of the post
 * @param {string} commentId - ID of the comment
 */
async function createPostCommentNotification(
  postOwnerId,
  commenterId,
  commenterUsername,
  postId,
  commentId
) {
  try {
    // Don't notify if the post owner is commenting on their own post
    if (postOwnerId === commenterId) {
      return;
    }

    const notification = {
      type: "comment_on_post",
      message: `${commenterUsername} commented on your post`,
      recipientId: postOwnerId,
      senderId: commenterId,
      postId,
      commentId,
    };

    await Notification.create(notification);
    return 1;
  } catch (error) {
    console.error("Error creating post comment notification:", error);
    throw error;
  }
}

/**
 * Create notification for comment author when someone replies to their comment
 * @param {number} originalCommentAuthorId - ID of the original comment author
 * @param {number} replierId - ID of the user replying
 * @param {string} replierUsername - Username of the replier
 * @param {string} postId - ID of the post
 * @param {string} replyCommentId - ID of the reply comment
 */
async function createCommentReplyNotification(
  originalCommentAuthorId,
  replierId,
  replierUsername,
  postId,
  replyCommentId
) {
  try {
    // Don't notify if the user is replying to their own comment
    if (originalCommentAuthorId === replierId) {
      return;
    }

    const notification = {
      type: "comment_reply",
      message: `${replierUsername} replied to your comment`,
      recipientId: originalCommentAuthorId,
      senderId: replierId,
      postId,
      commentId: replyCommentId,
    };

    await Notification.create(notification);
    return 1;
  } catch (error) {
    console.error("Error creating comment reply notification:", error);
    throw error;
  }
}

/**
 * Create notification for post owner when someone likes their post
 * @param {number} postOwnerId - ID of the post owner
 * @param {number} likerId - ID of the user liking the post
 * @param {string} likerUsername - Username of the liker
 * @param {string} postId - ID of the post
 */
async function createPostLikeNotification(
  postOwnerId,
  likerId,
  likerUsername,
  postId
) {
  try {
    // Don't notify if the post owner is liking their own post
    if (postOwnerId === likerId) {
      return;
    }

    // Check if a notification for this user liking this post already exists
    const existingNotification = await Notification.findOne({
      where: {
        type: "post_like",
        recipientId: postOwnerId,
        senderId: likerId,
        postId: postId,
      },
    });

    // If notification already exists, don't create a duplicate
    if (existingNotification) {
      return;
    }

    const notification = {
      type: "post_like",
      message: `${likerUsername} liked your post`,
      recipientId: postOwnerId,
      senderId: likerId,
      postId,
      commentId: null,
    };

    await Notification.create(notification);
    return 1;
  } catch (error) {
    console.error("Error creating post like notification:", error);
    throw error;
  }
}

/**
 * Create notification for comment author when someone likes their comment
 * @param {number} commentOwnerId - ID of the comment author
 * @param {number} likerId - ID of the user liking the comment
 * @param {string} likerUsername - Username of the liker
 * @param {string} postId - ID of the post
 * @param {string} commentId - ID of the comment
 */
async function createCommentLikeNotification(
  commentOwnerId,
  likerId,
  likerUsername,
  postId,
  commentId
) {
  try {
    // Don't notify if the comment author is liking their own comment
    if (commentOwnerId === likerId) {
      return;
    }

    // Check if a notification for this user liking this comment already exists
    const existingNotification = await Notification.findOne({
      where: {
        type: "comment_like",
        recipientId: commentOwnerId,
        senderId: likerId,
        commentId: commentId,
      },
    });

    // If notification already exists, don't create a duplicate
    if (existingNotification) {
      return;
    }

    const notification = {
      type: "comment_like",
      message: `${likerUsername} liked your comment`,
      recipientId: commentOwnerId,
      senderId: likerId,
      postId,
      commentId,
    };

    await Notification.create(notification);
    return 1;
  } catch (error) {
    console.error("Error creating comment like notification:", error);
    throw error;
  }
}

/**
 * Remove notification when someone unlikes a post
 * @param {number} postOwnerId - ID of the post owner
 * @param {number} unlikerId - ID of the user unliking the post
 * @param {string} postId - ID of the post
 */
async function removePostLikeNotification(postOwnerId, unlikerId, postId) {
  try {
    // Don't try to remove notification if the post owner is unliking their own post
    if (postOwnerId === unlikerId) {
      return;
    }

    await Notification.destroy({
      where: {
        type: "post_like",
        recipientId: postOwnerId,
        senderId: unlikerId,
        postId: postId,
      },
    });

    return 1;
  } catch (error) {
    console.error("Error removing post like notification:", error);
    throw error;
  }
}

/**
 * Remove notification when someone unlikes a comment
 * @param {number} commentOwnerId - ID of the comment author
 * @param {number} unlikerId - ID of the user unliking the comment
 * @param {string} commentId - ID of the comment
 */
async function removeCommentLikeNotification(
  commentOwnerId,
  unlikerId,
  commentId
) {
  try {
    // Don't try to remove notification if the comment author is unliking their own comment
    if (commentOwnerId === unlikerId) {
      return;
    }

    await Notification.destroy({
      where: {
        type: "comment_like",
        recipientId: commentOwnerId,
        senderId: unlikerId,
        commentId: commentId,
      },
    });

    return 1;
  } catch (error) {
    console.error("Error removing comment like notification:", error);
    throw error;
  }
}

/**
 * Replace @username mentions with clickable links in text
 * @param {string} text - The text to process
 * @returns {string} - Text with mentions converted to links
 */
function convertMentionsToLinks(text) {
  if (!text) return text;

  // First, skip converting inside URLs/emails by temporarily removing them
  const placeholders = [];
  let tmp = text
    .replace(/https?:\/\/[^\s)]+/gi, (m) => {
      placeholders.push(m);
      return `__URL_PLACEHOLDER_${placeholders.length - 1}__`;
    })
    .replace(/\bwww\.[^\s)]+/gi, (m) => {
      placeholders.push(m);
      return `__URL_PLACEHOLDER_${placeholders.length - 1}__`;
    })
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/gi, (m) => {
      placeholders.push(m);
      return `__URL_PLACEHOLDER_${placeholders.length - 1}__`;
    });

  // Replace @username with clickable links only when preceded by whitespace or start
  tmp = tmp.replace(
    /(\s|^)@([a-zA-Z0-9_-]{3,30})\b/g,
    (full, lead, uname) =>
      `${lead}\u003ca href="/u/${uname}" class="mention-link"\u003e@${uname}\u003c/a\u003e`
  );

  // Restore placeholders
  tmp = tmp.replace(
    /__URL_PLACEHOLDER_(\d+)__/g,
    (_, i) => placeholders[Number(i)]
  );

  return tmp;
}

module.exports = {
  extractMentions,
  createMentionNotifications,
  createPostCommentNotification,
  createCommentReplyNotification,
  createPostLikeNotification,
  createCommentLikeNotification,
  removePostLikeNotification,
  removeCommentLikeNotification,
  convertMentionsToLinks,
};
