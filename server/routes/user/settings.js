const dotenv = require("dotenv").config();
const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { isAuth } = require("../../middlewares/auth");
const Jimp = require("jimp");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure Cloudinary if credentials are available
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// Express 5 compatible upload configuration
// Use memory storage to handle files in memory, then upload manually
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        transformation: [{ width: 200, height: 200, crop: 'limit', quality: 'auto' }],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Helper function to save file locally
const saveFileLocally = async (buffer, filename) => {
  const avatarsDir = path.join(__dirname, '../../public/images/avatars/');
  
  // Ensure directory exists
  try {
    await fs.mkdir(avatarsDir, { recursive: true });
  } catch (err) {
    // Directory might already exist, that's okay
  }
  
  const filepath = path.join(avatarsDir, filename);
  await fs.writeFile(filepath, buffer);
  return `/images/avatars/${filename}`;
};

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
      response: {
        newDescription: user.description,
        user: user,
      },
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
      return res.status(400).json({ 
        code: 400, 
        message: "No file uploaded" 
      });
    }

    // Validate file type (extra safety)
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ 
        code: 400, 
        message: "Only image files are allowed" 
      });
    }

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ 
          code: 404, 
          message: "User not found" 
        });
      }

      let profilePicUrl;
      
      // Try Cloudinary first if configured
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        try {
          console.log('🌤️ Uploading to Cloudinary...');
          const result = await uploadToCloudinary(file.buffer, {
            public_id: `avatar_${user.username}_${uuidv4()}`,
            overwrite: true
          });
          
          profilePicUrl = result.secure_url;
          console.log('✅ Cloudinary upload successful:', profilePicUrl);
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', cloudinaryError.message);
          
          // Fallback to local storage
          const fileExtension = file.originalname.split('.').pop() || 'jpg';
          const filename = `${user.username}_${uuidv4()}.${fileExtension}`;
          profilePicUrl = await saveFileLocally(file.buffer, filename);
          console.log('✅ Local storage fallback successful:', profilePicUrl);
        }
      } else {
        // Use local storage if Cloudinary not configured
        console.log('💾 Using local storage (Cloudinary not configured)...');
        const fileExtension = file.originalname.split('.').pop() || 'jpg';
        const filename = `${user.username}_${uuidv4()}.${fileExtension}`;
        profilePicUrl = await saveFileLocally(file.buffer, filename);
        console.log('✅ Local storage upload successful:', profilePicUrl);
      }

      // Update user profile picture
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
      console.error('❌ Error updating profile picture:', err);
      res.status(500).json({
        code: 500,
        message: "Internal server error",
        error: err.message,
      });
    }
  }
);

module.exports = router;
