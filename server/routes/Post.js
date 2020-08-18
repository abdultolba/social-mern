const express = require('express')
const router = express.Router()

const Post = require('../models/Post')
const isAuth = require('../middlewares/auth')

router.post('/:id/like', isAuth, (req,res) => {
	const { id } = req.params

	if(!req.user)
		res.status(403).json({code: 403, response: "Error: Unauthorized request"})

	const query = {
		_id: id, 
		likedBy: {  "$nin": req.user._id }
	}

	const newValues = { 
		$push: { likedBy: req.user._id }, 
		$inc: {  likes: 1  } 
	}

	Post.findOneAndUpdate(query, newValues , { new: true })
		.then(likedPost => {
			if(!likedPost)
				return res.status(403).json({code: 403, response: "You've previously liked this post!"})
			res.status(200).json({code: 200, response: likedPost})
		})
		.catch(e => res.status(500).send("Error"))
})

router.post('/:id/unlike', isAuth, (req,res) => {
	const { id } = req.params;

	if(!req.user)
		res.status(403).json({code: 403, response: "Error: Unauthorized request"});

	const query = {
		_id: id, 
		likedBy: {  "$in": req.user._id  }
	};

	const newValues = { 
		$pull: { likedBy: req.user._id }, 
		$inc: { likes: -1 } 
	};

	Post.findOneAndUpdate(query, newValues, { new: true })
		.then(unlikedPost => {
			if(!unlikedPost)
				return res.status(403).json({code: 403, response: "You haven't liked this post yet."});
			res.status(200).json({code: 200, response: unlikedPost})
		})
		.catch(e => res.status(500).send("There were an error"));
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