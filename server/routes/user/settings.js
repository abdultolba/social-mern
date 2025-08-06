const dotenv = require("dotenv").config();
const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { isAuth } = require("../../middlewares/auth");
const Jimp = require("jimp");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("@fluidjs/multer-cloudinary");
const multer = require("multer");

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure upload strategy based on environment
let upload;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  upload = multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: (req, file) => {
        return {
          folder: "avatars",
          allowed_formats: ["png", "jpg", "jpeg"],
          public_id: `avatar_${req.user.username}_${Date.now()}`,
          transformation: [{ width: 200, height: 200, crop: "limit" }],
        };
      },
    }),
  });
} else {
  // Fallback to local storage if Cloudinary is not configured
  upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "public/images/avatars/");
      },
      filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        cb(null, `${req.user.username}.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"), false);
      }
    },
  });
}

router.patch("/privacy", isAuth, async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    user.openProfile = !user.openProfile;
    await user.save();

    res.status(200).send({
      code: 200,
      message: "Privacy settings updated",
      response: user,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Unknown error" });
  }
});

router.patch("/description", isAuth, async (req, res) => {
  const { id } = req.user;
  const { description } = req.body;

  if (description.length > 150) {
    return res.status(400).json({
      code: 400,
      message: "Your description may not have more than 150 characters",
    });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    user.description = description;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Description successfully updated!",
      response: user,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch(
  "/profilePicture",
  [isAuth, upload.single("newImage")],
  async (req, res) => {
    const { id } = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ code: 400, message: "No file uploaded" });
    }

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ code: 404, message: "User not found" });
      }

      // Handle different storage configurations
      let profilePicUrl;
      if (file.path) {
        // Cloudinary returns the full URL in file.path
        profilePicUrl = file.path;
      } else if (file.filename) {
        // Local storage - construct URL
        profilePicUrl = `/images/avatars/${file.filename}`;
      } else {
        // Fallback
        profilePicUrl = "/images/avatars/default/avatar_default_0.png";
      }

      user.profilePic = profilePicUrl;
      await user.save();

      res.status(200).json({
        code: 200,
        response: {
          message: "Photo updated successfully!",
          path: user.profilePic,
          user: {
            id: user.id,
            username: user.username,
            profilePic: user.profilePic,
          },
        },
      });
    } catch (err) {
      console.error("Error updating profile picture:", err);
      res
        .status(500)
        .json({
          code: 500,
          message: "Internal server error",
          error: err.message,
        });
    }
  }
);

module.exports = router;
