const multer = require('multer')
const express = require('express')
const path = require('path');
const fs = require('fs');

const router = express.Router()
const User = require('../models/User')
const Post = require('../models/Post')

router.get('/:username', (req,res) => {
	const { username } = req.params;

	User.findOne({username})
		.then(user => 
			user 
				? res.status(200).json({code: 200, response: user})
				: res.status(404).json({code: 404, response: "Error: Couldn't find user."}))
		.catch(e => res.send(500).json({error: 'Error'}));

});

router.get('/:username/posts', (req,res) => {
	const { username: profile } = req.params
	const { offset = 0, quantity = 20 } = req.query

	Post.find({profile})			
		.skip(parseInt(offset))
		.limit(parseInt(quantity))
		.sort('-createdAt')
		.populate('author')
		.exec((err, posts) => {
			if(err) return res.status(500).send("Error")
			res.status(200).json({
				code: 200,
				response: posts
			})
		})
})

router.post('/:username/new/post', (req,res) => {
	const { username: profile } = req.params
	const { message } = req.body
	const { _id: author } = req.user

	new Post({ author, profile, message })
		.save()
		.then(newPost => {
			Post.populate(newPost, {path: 'author'}, (err, populatedPost) => {
				res.status(200).json({
					code: 200,
					response: populatedPost
				})
			})			
		})
		.catch(e => res.status(500).send("Error."))
})

router.post('/:username/delete/post', (req,res) => {
	const { username: profile } = req.params;
	const { postId } = req.body;
	const { _id: authorId,username } = req.user;
	Post.findById(postId)
		.then(post => {
			if(authorId == post.author || username == post.profile){
				Post.findByIdAndRemove(post._id)
					.then(removedPost => res.status(200).json({
						code: 200,
						response: post
					}))
			}
			else{
				res.status(500).send("Error: Not your post.")
			}
		})
		.catch(e => res.status(500).send("Error."));
})

router.post('/:username/edit/info/description', (req,res) => {
	const { username } = req.params;
	const { description } = req.body;
	if(req.user.username != username)
		return res.status(401).json({ code: 401, response: "Error: Unauthorized Request"});

	User.findOneAndUpdate({ username }, { description: description }, { new: true, useFindAndModify: false })
		.then(updatedUser => res.status(200).json(
			{
				code: 200,
				response: {
					message: 'Success. The description has been updated.',
					newDescription: updatedUser.description,
					updatedUser
				}
			})
		)
		.catch(e => res.status(500).send(e));
})

let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/images/avatars')
	},
	filename: (req, file, cb) => {
		cb(null, `${req.params.username}_${Date.now()}.png`)
	}
})

const upload = multer({storage: storage});

router.post('/:username/edit/info/profilePicture', upload.single('newImage'), (req,res, next) => {
	const { username } = req.params;

	if(!req.file)
		res.status(500).json(
			{
				code: 500,
				response: "Error."
			}
		);

	User.findOneAndUpdate({ username }, { profilePic: `images/avatars/${req.file.filename}` }, { new: true, useFindAndModify: false })
		.then(updatedUser => {
			res.status(200).json(
				{
					code: 200,
					response: {
						message: 'Photo changed successfully!',
						path: updatedUser.profilePic,
						updatedUser
					}
				}
			)
		})
		.catch(e => res.status(500).send(e));
})

module.exports = router