const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const User = require('../models/User');
const router = express.Router();

router.post('/sign-up', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password)
		res.status(400).send('Please provide all the information.');

	User.findOne({ username })
		.then(user => {
			if (user) return res.status(403).json({ code: 403, response: 'User already registered' });
			bcrypt.genSalt(5)
				.then(salt => bcrypt.hash(password, salt))
				.then(hashPassword => new User({ username, password: hashPassword }).save())
				.then(newUser => {
					const token = jwt.sign({
						data: newUser,
						exp: Math.floor(Date.now() / 1000) + (60 * 60)
					}, SECRET_KEY)

					res.status(200).json({
						code: 200,
						response: {
							token,
							username: newUser.username,
							profilePic: newUser.profilePic,
							description: newUser.description,
							verified: newUser.verified,
							_id: newUser._id
						}
					})
				})
				.catch(e => res.send(500).json({ error: 'Error.' }))
		})
		.catch(e => res.status(500).send('Error.'))
});

router.post('/sign-in', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password)
		res.status(400).json({ code: 400, message: 'You must provide all the information' })

	User.findOne({ username })
		.select('+password')
		.then(user => {
			if (!user)
				res.status(404).json({ code: 404, message: 'User not found' })

			bcrypt.compare(password, user.password)
				.then(successLogged => !successLogged ? res.status(403).json({ code: 403, message: 'Invalid password' }) : user)
				.then(user =>
					jwt.sign({
						data: user,
						exp: Math.floor(Date.now() / 1000) + (60 * 60)
					}, SECRET_KEY))
				.then(token => res.status(200).json({
					code: 200,
					response: {
						token,
						username: user.username,
						profilePic: user.profilePic,
						description: user.description,
						verified: user.verified,
						_id: user._id
					}
				}))
				.catch(e => res.send(500).json({ error: 'There were an error.' }));
		})
		.catch(e => res.send(500).json({ error: 'There were an error.' }));
})

module.exports = router;
