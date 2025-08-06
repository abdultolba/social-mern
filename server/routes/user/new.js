const express = require("express");
const router = express.Router();
const { Post, User } = require("../../models");
const { isAuth } = require("../../middlewares/auth");

// This file is for routes under /api/user/new/...
// But the frontend expects /api/user/:username/new/post
// So the new post route has been moved to basics.js

module.exports = router;
