const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route    Post api/post
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

//@route    PUT api/post/like/:id
//@desc     like a post
//@acess    Private
router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(401).send('No such Post');
		}

		// check if already been liked
		if (
			post.likes.filter(like => like.user.toString() === req.user.id).length > 0
		) {
			return res.status(400).json({ msg: 'Post was already liked' });
		}
		post.likes.unshift({ user: req.user.id });

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		if (err.kind === 'objectId') {
			return res.status(401).send('No such Post');
		}
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    PUT api/post/unlike/:id
//@desc     unlike a post
//@acess    Private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(401).send('No such Post');
		}

		// check if already been liked
		if (
			post.likes.filter(like => like.user.toString() === req.user.id).length ===
			0
		) {
			return res.status(400).json({ msg: 'Post has not been liked' });
		}
		// get remove index
		const removeIndex = post.likes
			.map(like => like.user.toString())
			.indexOf(req.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		return res.json(post.likes);
	} catch (err) {
		if (err.kind === 'objectId') {
			return res.status(401).send('No such Post');
		}
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    Post api/post/comment/:id
//@desc     Add comment to post
//@acess    Private
router.post(
	'/comment/:id',
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
			const post = await Post.findById(req.params.id);

			if (!post) {
				return res.status(401).send({ msg: 'No such Post' });
			}

			const newComment = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			});

			post.comments.unshift(newComment);

			await post.save();

			return res.json(post.comments);
		} catch (err) {
			if (err.kind === 'ObjectId') {
				return res.status(401).send('No such Post');
			}
			console.error(err.message);
			return res.status(500).send('Server Error');
		}
	}
);

//@route    DELETE api/post/comment/:id/:c_id
//@desc     Delete comment from post
//@acess    Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Pull out comment
		const comment = post.comments.find(
			comment => comment.id === req.params.comment_id
		);

		// Make sure comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		// Check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// Get remove index
		const removeIndex = post.comments
			.map(comment => comment.id)
			.indexOf(req.params.comment_id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});
module.exports = router;
