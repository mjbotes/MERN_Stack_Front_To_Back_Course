const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route    GET api/profile/me
//@desc     Get current users profile
//@acess    Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('server Error');
	}
});

//@route    POST api/profile
//@desc     Create/update users profile
//@acess    Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required')
				.not()
				.isEmpty(),
			check('skills', 'skills is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		// Build Profile Object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			//splits a comma seperated string to an array
			profileFields.skills = skills.split(',').map(skill => skill.trim());
		}

		// Build Social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true }
			);
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

//@route    GET api/profile
//@desc     Get all profiles
//@acess    Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		return res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by user ID
//@acess    Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({ msg: 'Profile not found' });
		}

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server Error');
	}
});

//@route    DELETE api/profile
//@desc     Delete profile, user & posts
//@acess    Private
router.delete('/', auth, async (req, res) => {
	try {
		//Remove user posts
		await Post.deleteMany({ user: req.user.id });

		await Profile.findOneAndRemove({ user: req.user.id });

		await User.findOneAndRemove({ _id: req.user.id });

		return res.json({ msg: 'User Removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    PUT api/profile/experience
//@desc     Add Profile Experience
//@acess    Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is Required')
				.not()
				.isEmpty(),
			check('company', 'Company is Required')
				.not()
				.isEmpty(),
			check('from', 'From date is Required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete Experience from profile
//@acess    Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get Remove index
		const removeIndex = profile.experience
			.map(item => item.id)
			.indexOf(req.params.exp_id);

		// Remove from array
		profile.experience.splice(removeIndex, 1);

		await profile.save();

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server Error');
	}
});

//@route    PUT api/profile/education
//@desc     Add Profile Education
//@acess    Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is Required')
				.not()
				.isEmpty(),
			check('degree', 'Degree is Required')
				.not()
				.isEmpty(),
			check('fieldOfStudy', 'Field of Study is Required')
				.not()
				.isEmpty(),
			check('from', 'From date is Required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const {
			school,
			degree,
			fieldOfStudy,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldOfStudy,
			location,
			from,
			to,
			current,
			description
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

//@route    DELETE api/profile/experience/:edu_id
//@desc     Delete Education from profile
//@acess    Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get Remove index
		const removeIndex = profile.education
			.map(item => item.id)
			.indexOf(req.params.edu_id);

		// Remove from array
		profile.education.splice(removeIndex, 1);

		await profile.save();

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server Error');
	}
});

//@route    GET api/profile/github/:username
//@desc     Get users Repos from github
//@acess    Public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `http://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' }
		};

		request(options, (error, response, body) => {
			if (error) return console.error(error);
			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			return res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send('server Error');
	}
});

module.exports = router;
