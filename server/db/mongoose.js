const mongoose = require('mongoose')
const dotenv = require('dotenv').config();

// const { MONGO_URI } = require('../config')
const { MONGO_URI } = process.env

const config = {
	useNewUrlParser: true, 
	useUnifiedTopology: true
}

mongoose.connect(MONGO_URI, config)

module.exports = mongoose