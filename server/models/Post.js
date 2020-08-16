const mongoose = require('mongoose')
const User = require('./User')
const { Schema } = mongoose

const postSchema = new Schema({
	author: {type: mongoose.Schema.Types.ObjectId, ref: User},
	createdAt: {type: Date, default: Date.now},
	profile: String,
	message: String
})

const post = mongoose.model('post', postSchema)

module.exports = post