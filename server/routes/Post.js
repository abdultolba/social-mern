const express = require('express')
const router = express.Router()
const { Post, User } = require('../models')
const { isAuth } = require('../middlewares/auth')

// GET /api/post/:id
router.get('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const post = await Post.findByPk(id, {
      include: {
        model: User,
        as: 'author',
        attributes: ['username', 'profilePic']
      }
    })

		if (!post) {
			return res.status(404).json({ code: 404, message: 'Post not found' })
		}

		res.status(200).json({ code: 200, response: post })
	} catch (err) {
		res.status(500).json({ error: 'An unknown error occurred.' })
	}
})

// PATCH /api/post/:id
router.patch('/:id', isAuth, async (req, res) => {
	const { id } = req.params
	const { message } = req.body

	try {
		const post = await Post.findOne({ where: { id, authorId: req.user.id } })

		if (!post) {
			return res.status(404).json({ code: 404, message: 'Post not found or you are not the author.' })
		}

		post.message = message
		await post.save()

		res.status(200).json({
			code: 200,
			message: 'Post successfully updated!',
			response: post
		})
	} catch (err) {
		res.status(500).send('Your post couldn\'t be updated.')
	}
})

// DELETE /api/post/:id
router.delete('/:id', isAuth, async (req, res) => {
	const { id } = req.params

	try {
		const post = await Post.findOne({ where: { id, authorId: req.user.id } })

		if (!post) {
			return res.status(404).json({ code: 404, message: 'Post not found or you are not the author.' })
		}

		await post.destroy()

		res.status(200).json({ code: 200, message: 'Post deleted', deletedPost: post })
	} catch (err) {
		res.status(500).json({ code: 500, message: 'There was an error deleting the post' })
	}
})

// POST /api/post/:id/like
router.post('/:id/like', isAuth, async (req, res) => {
	const { id } = req.params

	try {
		const post = await Post.findByPk(id)

		if (!post) {
			return res.status(404).json({ code: 404, message: 'Post not found' })
		}

    const user = await User.findByPk(req.user.id)

    // Check if the user has already liked the post
    const hasLiked = await post.hasLikedByUser(user)
    if (hasLiked) {
      return res.status(403).json({ code: 403, response: "You already liked this post" })
    }

		await post.addLikedByUser(user)
		post.likes = await post.countLikedByUsers()
		await post.save()

		// Fetch the updated post with all associations
		const updatedPost = await Post.findByPk(id, {
			include: [{
				model: User,
				as: 'author',
				attributes: ['id', 'username', 'profilePic']
			}, {
				model: User,
				as: 'likedByUsers',
				attributes: ['id', 'username']
			}]
		})

		res.status(200).json({ code: 200, response: updatedPost })
	} catch (err) {
		res.status(500).send("There was an error")
	}
})

// POST /api/post/:id/unlike
router.post('/:id/unlike', isAuth, async (req, res) => {
	const { id } = req.params

	try {
		const post = await Post.findByPk(id)

		if (!post) {
			return res.status(404).json({ code: 404, message: 'Post not found' })
		}

    const user = await User.findByPk(req.user.id)

    // Check if the user has liked the post
    const hasLiked = await post.hasLikedByUser(user)
    if (!hasLiked) {
      return res.status(403).json({ code: 403, response: "You haven't liked this post yet" })
    }

		await post.removeLikedByUser(user)
		post.likes = await post.countLikedByUsers()
		await post.save()

		// Fetch the updated post with all associations
		const updatedPost = await Post.findByPk(id, {
			include: [{
				model: User,
				as: 'author',
				attributes: ['id', 'username', 'profilePic']
			}, {
				model: User,
				as: 'likedByUsers',
				attributes: ['id', 'username']
			}]
		})

		res.status(200).json({ code: 200, response: updatedPost })
	} catch (err) {
		res.status(500).send("There was an error")
	}
})

module.exports = router
