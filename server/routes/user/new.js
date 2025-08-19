import express from "express";
import { createRequire } from "module";
import { Post, User } from "../../models/index.js";
const require = createRequire(import.meta.url);
const { isAuth } = require("../../middlewares/auth").default;
const router = express.Router();

// This file is for routes under /api/user/new/...
// But the frontend expects /api/user/:username/new/post
// So the new post route has been moved to basics.js

export default router;
