const mongoose = require('mongoose')
const { Schema } = mongoose

const getRandomProfilePicture = () => `/assets/images/avatar_default_${Math.floor((Math.random() * 5) + 0)}.png`

const userSchema = new Schema({
	username: String,
	password: {type: String, select: false},
	verified: {type: Boolean, default: false},
	description: {type: String, default: ''},
	// Simulating diverse social media platform by using variety of random user pics
	profilePic: {type: String, default: getRandomProfilePicture}
})

userSchema.methods.findByUsername = (username, callback) => {
	return this.model('User').find({ username }, callback)
}

const user = mongoose.model('user', userSchema)

module.exports = user