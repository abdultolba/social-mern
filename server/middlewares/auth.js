const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()

const { SECRET_KEY: secret } = require('../config')
const SECRET_KEY = process.env.SECRET_KEY || secret

const isAuth = (req, res, next) => {
	const token = req.header('authToken')
	if (token) {
		jwt.verify(token, SECRET_KEY, (err, decoded) => {
			if (err) return res.status(401).json({ code: 401, message: 'Session expired' })

			req.user = decoded.data
		})
	}
	next();
}

module.exports = { isAuth }