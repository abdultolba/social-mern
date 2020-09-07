const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const {isAuth} = require('../../middlewares/auth')
const Jimp = require('jimp')
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer')
const path = require('path')
const shortId = require('shortid')
const chalk = require('chalk')

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'avatars',
		allowed_formats: ['png', 'jpg', 'jpeg'],
		public_id: (req, file) => {
			console.log(req)
			return `${req.user.username}`
		},
		transformation: [{ width: 150, height: 150, crop: 'limit' }]
	}
})

const upload = multer({storage: storage})
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 	  	cb(null, path.resolve(__dirname, '../..' , 'public/images/avatars'))
// 	},
// 	filename: (req, file, cb) => {
// 		const user = req.user
// 		console.log(user, user.username)
// 	  	cb(null, `${user.username}.png`)
// 	}
// })


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

	const image = {
		url: file.url,
		id: file.public_id
	}

	// console.log(chalk.white.bgBlue('req.body.crop:', req.body.crop ))

	// const { x, y, width, height } = JSON.parse(req.body.crop)
	// Jimp.read(path.resolve(file.destination, file.filename))
	// .then(img => {
	// 	return img
	// 		.crop( x, y, width, height )
	// 		.resize(150,150)
	// 		.quality(100)
	// 		.write(path.resolve(req.file.destination, req.file.filename))
	// })
	// .catch(err => {
	// 	console.log(chalk.white.bgRed.bold('Error at line 77 in server/routes/user/settings.js'))
	// 	res.status(500).send(err)
	// })

	User.findByIdAndUpdate(_id, { profilePic: image.url }, { new: true, useFindAndModify: false })
		.then(updatedUser => {
			res.status(200).json({
				code: 200,
				response: {
					message: 'Photo updated successfully!',
					path: updatedUser.profilePic,
					// path: `${updatedUser.profilePic}?hash=${shortId.generate()}`,
					updatedUser
				}
			})
		})
		.catch(e => res.status(500).send(e))
})

module.exports = router