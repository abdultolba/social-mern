import express from "express";
import { Post, User } from "../../models/index.js";
import Auth from "../../middlewares/auth.js";
const { isAuth } = Auth;
const router = express.Router();

// This file is for routes under /api/user/new/...
// But the frontend expects /api/user/:username/new/post
// So the new post route has been moved to basics.js

export default router;
