const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route    GET api/post
//@desc     Add post
//@acess    Private
router.post(
	'/',
	[
		auth,
		[
			check('text', 'text is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			});

			const post = await newPost.save();

			return res.json(post);
		} catch (error) {
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

//@route    GET api/post
//@desc     Get all posts
//@acess    Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		return res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('server Error');
	}
});

//@route    GET api/post/:id
//@desc     Get post by ID
//@acess    Private
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).send('Post Not found');
		}

		return res.json(post);
	} catch (err) {
		if (err.kind === 'ObjectId') {
			return res.status(404).send('Post Not found');
		}
		console.error(err.message);
		res.status(500).send('server Error');
	}
});

//@route    DEL api/post/:id
//@desc     Delete post by ID
//@acess    Private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check user

		if (!post) {
			return res.status(404).send('Post Not found');
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'user not Authorized' });
		}

		await post.remove();

		return res.json({ msg: 'Post removed' });
	} catch (err) {
		if (err.kind === 'ObjectId') {
			return res.status(404).send('Post Not found');
		}
		console.error(err.message);
		res.status(500).send('server Error');
	}
});

module.exports = router;
