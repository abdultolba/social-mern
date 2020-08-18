const express = require('express')
const router = express.Router()
const Post = require('../models/Post')

router.post('/:id/like', (req,res) => {
	const { id } = req.params

	if(!req.user)
		res.status(403).json({code: 403, response: "Error: Unauthorized request"})

	Post.findOneAndUpdate({_id: id, likedBy: { "$nin": req.user._id }}, { $push: {likedBy: req.user._id}, $inc: { likes: 1 } }, { new: true })
		.then(likedPost => {
			if(!likedPost)
				return res.status(403).json({code: 403, response: "You've previouslyliked this post!"})
			res.status(200).json({code: 200, response: likedPost})
		})
		.catch(e => res.status(500).send("Error"))
})

router.get('/:id', (req,res) => {
	const { id } = req.params

	Post.findById(id)
		.then(post => 
			post 
				? res.status(200).json({code: 200, response: post})
				: res.status(404).json({code: 404, response: "Couldn't find post."}))
		.catch(e => res.send(500).json({error: 'Error.'}))
});

module.exports = router