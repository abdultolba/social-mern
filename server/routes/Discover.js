const express = require('express')
const router = express.Router()

const { User, Post } = require('../models')

router.get('/users', async (req, res) => {
    try {
        const count = await User.count()
        if (count === 0) {
            return res.status(200).json({
                code: 200,
                response: []
            })
        }
        
        // Get random users, but ensure we don't exceed the total count
        const limit = Math.min(10, count)
        const offset = count > limit ? Math.floor(Math.random() * (count - limit)) : 0
        
        const users = await User.findAll({
            limit,
            offset,
            attributes: ['id', 'username', 'profilePic', 'description']
        })

        res.status(200).json({
            code: 200,
            response: users
        })
    } catch (err) {
        console.error('Error fetching users:', err)
        return res.status(500).json({
            message: 'There was an error fetching the users',
            error: err.message
        })
    }
})

router.get('/posts', async (req, res) => {
    try {
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
        
        const count = await Post.count()
        if (count === 0) {
            return res.status(200).json({
                code: 200,
                response: []
            })
        }
        
        // Get random posts, but ensure we don't exceed the total count
        const limit = Math.min(10, count)
        const offset = count > limit ? Math.floor(Math.random() * (count - limit)) : 0
        
        const posts = await Post.findAll({
            limit,
            offset,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profilePic']
            }, {
                model: User,
                as: 'likedByUsers',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
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
    } catch (err) {
        console.error('Error fetching posts:', err)
        return res.status(500).json({
            message: "Posts couldn't be fetched",
            error: err.message
        })
    }
})

module.exports = router