const express = require('express')
const router = express.Router()

const { User, Post } = require('../../models')

const { isAuth } = require('../../middlewares/auth')

router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params

        const user = await User.findOne({ where: { username } })
        if (!user) {
            return res.status(404).json({ code: 404, response: 'User not found' })
        }

        // Count posts by this user
        const posts = await Post.count({ where: { authorId: user.id } })
        
        // Count likes received by this user's posts
        const userPosts = await Post.findAll({
            where: { authorId: user.id },
            include: [{
                model: User,
                as: 'likedByUsers',
                attributes: ['id']
            }]
        })
        
        // Sum up all likes across all posts
        const likes = userPosts.reduce((total, post) => {
            return total + (post.likedByUsers ? post.likedByUsers.length : 0)
        }, 0)

        res.status(200).json({
            code: 200,
            response: {
                posts,
                likes,
                ...user.toJSON()
            }
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        res.status(500).json({ code: 500, error: 'There was an error.' })
    }
})

router.get('/:username/posts', async (req, res) => {
    try {
        const { username: profile } = req.params
        const { offset = 0, quantity = 50 } = req.query
        
        // Get current user from auth header (optional)
        let currentUser = null
        const authHeader = req.header('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken')
                const token = authHeader.split(' ')[1]
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                currentUser = await User.findByPk(decoded.data.id)
            } catch (err) {
                // Invalid token, continue as guest
            }
        }

        // Find the user first
        const user = await User.findOne({ where: { username: profile } })
        if (!user) {
            return res.status(404).json({ code: 404, response: 'User not found' })
        }

        // Find posts by this user
        const posts = await Post.findAll({
            where: { authorId: user.id },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profilePic']
            }, {
                model: User,
                as: 'likedByUsers',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(quantity)
        })

        // Add liked status for current user
        const postsWithLikeStatus = posts.map(post => {
            const postData = post.toJSON()
            postData.liked = currentUser ? 
                postData.likedByUsers.some(user => user.id === currentUser.id) : false
            return postData
        })

        res.status(200).json({
            code: 200,
            response: postsWithLikeStatus
        })
    } catch (error) {
        console.error('Error fetching user posts:', error)
        res.status(500).json({ code: 500, error: 'There was an error' })
    }
})

router.get('/:username/likes', async (req, res) => {
    try {
        const { username } = req.params

        // Find the user first
        const user = await User.findOne({ where: { username } })
        if (!user) {
            return res.status(404).json({ code: 404, response: 'User not found' })
        }

        // Find posts liked by this user using the many-to-many relationship
        const likedPosts = await user.getLikedPosts({
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profilePic']
            }],
            limit: 2,
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({
            code: 200,
            response: likedPosts
        })
    } catch (error) {
        console.error('Error fetching liked posts:', error)
        res.status(500).json({ code: 500, error: 'There was an error' })
    }
})

router.post('/:username/new/post', isAuth, async (req, res) => {
    try {
        const { username: profile } = req.params
        let { message, extra = null } = req.body
        const { id: authorId } = req.user

        // Find the profile user
        const profileUser = await User.findOne({ where: { username: profile } })
        if (!profileUser) {
            return res.status(404).json({ code: 404, response: 'Profile user not found' })
        }

        if (extra && extra.value && extra.extraType) {
            extra.value = extra.value.split('=')[1]
        } else {
            extra = null
        }

        // Create new post
        const newPost = await Post.create({
            authorId,
            profileId: profileUser.id,
            message,
            extra
        })

        // Fetch the post with author info
        const populatedPost = await Post.findByPk(newPost.id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profilePic']
            }]
        })

        res.status(200).json({
            code: 200,
            response: populatedPost
        })
    } catch (error) {
        console.error('Error creating post:', error)
        res.status(500).json({ code: 500, error: "We couldn't save your post." })
    }
})

module.exports = router