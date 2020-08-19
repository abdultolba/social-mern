const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const User = require('../models/User')
const Post = require('../models/Post')

const isAuth = require('../middlewares/auth')

router.get('/:username', (req,res) => {
	let { username } = req.params
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

router.get('/:username/likes', (req,res) => {
	// TODO: Search by username
	Post.find({likedBy: { $in: '5db63be3e070d70df8fa8761' }})
		.limit(2)
		.exec((err, posts) => {
			res.send(posts)
		})
})

router.post('/:username/new/post', isAuth, (req,res) => {
	const { username: profile } = req.params
	let { message, extra = null } = req.body
	const { _id: author } = req.user

	if (extra.value && extra.extraType) {
		extra.value = extra.value.split('=')[1];
	} else {
		extra = null;
	}

	new Post({ author, profile, message, extra })
		.save()
		.then(newPost => {
			Post.populate(newPost, {path: 'author'}, (err, populatedPost) => {
				res.status(200).json({
					code: 200,
					response: populatedPost
				})
			})			
		})
		.catch(e => res.status(500).send("Sorry, your post couldn't be saved."))
})

router.post('/:username/edit/info/description', isAuth, (req,res) => {
	const { username } = req.params;
	const { description } = req.body;
	if(req.user.username != username)
		return res.status(401).json({ code: 401, response: "Error: Unauthorized Request"})

	if(description.length > 150)
		return res.status(400).json({code: 400, message: "Error: Descriptions may not have more than 150 characters"})

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
				response: "Error: Your profile photo could not be saved. Please try again later. "
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