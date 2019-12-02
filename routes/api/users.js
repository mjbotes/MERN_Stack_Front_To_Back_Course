const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

//@route    POST api/users
//@desc     Register User
//@acess    Public
router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please enter a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, password } = req.bodu;
		try {
			// See if user Exists

			let user = User.findOne({ email });

			if (user) {
				res.status(400).json({ errors: [{ msg: 'User already exists' }] });
			}

			// Get users Gravatar

			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});

			user = new User({
				name,
				email,
				avatar,
				password
			});

			// Encrypt Password

			const salt = bcrypt.genSalt(10);

			user.password = bcrypt.hash(password, salt);

			// Save user to MongoDB

			await user.save();

			// Return jsonwebtokem

			res.send('Users Route');
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server Error!!');
		}
	}
);

module.exports = router;
