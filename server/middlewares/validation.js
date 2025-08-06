const { body, param, validationResult } = require("express-validator");
const { User } = require("../models");

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Post content validation rules
const validatePostContent = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters")
    .matches(/^(?!\s*$)/)
    .withMessage("Message cannot be only whitespace"),

  body("extra")
    .optional()
    .isObject()
    .withMessage("Extra data must be an object"),

  handleValidationErrors,
];

// Username parameter validation
const validateUsername = [
  param("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, dots, underscores, and hyphens"
    ),

  handleValidationErrors,
];

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ code: 401, message: "Authentication required" });
    }

    const now = Date.now();
    const userRequests = rateLimitStore.get(userId) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        code: 429,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current request
    validRequests.push(now);
    rateLimitStore.set(userId, validRequests);

    next();
  };
};

// Permission validation middleware
const validateWallPostPermission = async (req, res, next) => {
  try {
    const { username } = req.params;
    const authorId = req.user.id;

    // Find the profile owner
    const normalizedUsername = username.toLowerCase();
    const profileOwner = await User.findOne({
      where: { username: normalizedUsername },
      attributes: ["id", "username", "openProfile", "verified"],
    });

    if (!profileOwner) {
      return res.status(404).json({
        code: 404,
        message: "Profile not found",
      });
    }

    // Store profile owner info for later use
    req.profileOwner = profileOwner;

    // Check if user is trying to post on their own wall (always allowed)
    if (profileOwner.id === authorId) {
      return next();
    }

    // Check if the profile is open for posts
    if (!profileOwner.openProfile) {
      return res.status(403).json({
        code: 403,
        message:
          "This user has a closed profile. You cannot post on their wall.",
        profileClosed: true,
      });
    }

    // TODO: Additional checks could be added here:
    // - Block list check
    // - Friend-only posting
    // - Mutual follow requirement

    next();
  } catch (error) {
    console.error("Permission validation error:", error);
    res.status(500).json({
      code: 500,
      message: "Error validating permissions",
    });
  }
};

// Content safety validation
const validateContentSafety = (req, res, next) => {
  const { message } = req.body;

  // Basic content filters (expand as needed)
  const prohibited = [
    // Add prohibited words/patterns here
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
  ];

  for (const pattern of prohibited) {
    if (pattern.test(message)) {
      return res.status(400).json({
        code: 400,
        message: "Message contains prohibited content",
      });
    }
  }

  next();
};

// User existence validation middleware
const validateUserExists = async (req, res, next) => {
  try {
    const { username } = req.params;
    const normalizedUsername = username.toLowerCase();

    const user = await User.findOne({
      where: { username: normalizedUsername },
      attributes: ["id", "username", "openProfile", "verified"],
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        response: "User not found",
      });
    }

    req.targetUser = user;
    next();
  } catch (error) {
    console.error("User validation error:", error);
    res.status(500).json({
      code: 500,
      error: "Error validating user",
    });
  }
};

// Privacy validation for viewing posts
const validateViewPermission = (req, res, next) => {
  const targetUser = req.targetUser;
  const currentUser = req.user; // May be null for guests

  // If profile is open, anyone can view
  if (targetUser.openProfile) {
    return next();
  }

  // If profile is closed and user is not authenticated
  if (!currentUser) {
    return res.status(403).json({
      code: 403,
      message: "This profile is private. Please log in to view.",
      requiresAuth: true,
    });
  }

  // If user is viewing their own profile
  if (currentUser.id === targetUser.id) {
    return next();
  }

  // Profile is closed and user is not the owner
  return res.status(403).json({
    code: 403,
    message: "This profile is private.",
    profileClosed: true,
  });
};

module.exports = {
  validatePostContent,
  validateUsername,
  validateWallPostPermission,
  validateContentSafety,
  validateUserExists,
  validateViewPermission,
  rateLimit,
  handleValidationErrors,
};
