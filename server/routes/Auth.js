const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const { User } = require('../models'); // Use Sequelize User model
const router = express.Router();

const { SECRET_KEY } = process.env;

// POST /api/auth/sign-up
router.post('/sign-up', async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ code: 400, message: 'Please provide all required information.' });
	}

	try {
		const existingUser = await User.findOne({ where: { username } });
		if (existingUser) {
			return res.status(403).json({ code: 403, message: 'User already registered.' });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({ 
			username, 
			password: hashedPassword 
		});

		const userResponse = newUser.get({ plain: true });
		delete userResponse.password;

		const token = jwt.sign(
			{ data: userResponse },
			SECRET_KEY,
			{ expiresIn: '1h' } // Modern JWT expiration
		);

		res.status(201).json({
			code: 201,
			response: {
				token,
				...userResponse
			}
		});
	} catch (error) {
		console.error('Sign-up error:', error);
		res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
	}
});

// POST /api/auth/sign-in
router.post('/sign-in', async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ code: 400, message: 'You must provide a username and password.' });
	}

	try {
		const user = await User.findOne({ where: { username } });

		if (!user) {
			return res.status(404).json({ code: 404, message: 'User not found.' });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(403).json({ code: 403, message: 'Invalid credentials.' });
		}

		const userResponse = user.get({ plain: true });
		delete userResponse.password;

		const token = jwt.sign(
			{ data: userResponse },
			SECRET_KEY,
			{ expiresIn: '1h' } // Modern JWT expiration
		);

		res.status(200).json({
			code: 200,
			response: {
				token,
				...userResponse
			}
		});
	} catch (error) {
		console.error('Sign-in error:', error);
		res.status(500).json({ code: 500, message: 'An unexpected error occurred.' });
	}
});

module.exports = router;
