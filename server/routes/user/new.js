const express = require('express')
const router = express.Router()
const { Post, User } = require('../../models')
const { isAuth } = require('../../middlewares/auth')

// POST /api/user/new/post/:username
router.post('/new/post/:username', isAuth, async (req, res) => {
    const { message } = req.body
    let { extra = null } = req.body
    const authorId = req.user.id

    if (!message) {
        return res.status(400).json({ code: 400, message: 'Message is required' })
    }

    try {
        // Process the extra data if provided
        let extraType = null;
        let extraValue = null;

        if (extra && extra.value && extra.extraType) {
            extraType = extra.extraType;
            extraValue = extra.value.includes('=') ? extra.value.split('=')[1] : extra.value;
        }

        const newPost = await Post.create({
            message,
            authorId,
            extraType,
            extraValue
        })

        // Fetch the post with author information
        const populatedPost = await Post.findByPk(newPost.id, {
            include: {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profilePic']
            }
        })

        res.status(201).json({
            code: 201,
            response: populatedPost
        })
    } catch (err) {
        console.error('Post creation error:', err)
        res.status(500).json({ code: 500, message: "We couldn't save your post." })
    }
})

module.exports = router
