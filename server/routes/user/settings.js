const dotenv = require('dotenv').config()
const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const {isAuth} = require('../../middlewares/auth')
const Jimp = require('jimp')
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer')

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env
// const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = require('../../config');

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'avatars',
		allowed_formats: ['png', 'jpg', 'jpeg'],
		public_id: (req, file) => {
			return `${req.user.username}`
		},
		transformation: [{ width: 200, height: 200, crop: 'limit' }]
	}
})

const upload = multer({storage: storage})

router.patch('/privacy', isAuth, (req,res) => {
	const { _id } = req.user

	User.findById(_id)
		.then(user => {
			user.openProfile = !user.openProfile
			return user.save()
		})
		.then(updatedUser => {
			res.status(200).send({
				code: 200,
				message: 'Privacy settings updated',
				response: updatedUser
			})
		})
		.catch(e => res.status(500).send({ code: 500, message: 'Unknown error'}))
})

router.patch('/description', isAuth, (req,res) => {
	const { _id } = req.user
	const { description } = req.body

	if(description.length > 150)
		return res.status(400).json({
			code: 400, 
			message: "Your description may not have more than 150 characters"
		})

	User.findByIdAndUpdate(_id, { description: description }, { new: true, useFindAndModify: false })
	.then(updatedUser => {
		updatedUser = updatedUser.toObject()

		res.status(200).json({
			code: 200,
			message: 'Description successfully updated!',
			response: {
				newDescription: updatedUser.description,
				updatedUser
			}
		})
	})
	.catch(e => res.status(500).send(e))
})

router.patch('/profilePicture', [isAuth, upload.single('newImage')] , (req,res) => {
	const { _id } = req.user
	const file = req.file

	if(!file){
		res.status(500).json({code: 500, response: "There was an error"})
	}

	User.findByIdAndUpdate(_id, { profilePic: file.path }, { new: true, useFindAndModify: false })
		.then(updatedUser => {
			res.status(200).json({
				code: 200,
				response: {
					message: 'Photo updated successfully!',
					path: updatedUser.profilePic,
					updatedUser
				}
			})
		})
		.catch(e => res.status(500).send(e))
})

module.exports = router