const express = require('express');

const PostController = require('../controllers/posts');
const checkAuth = require('../middleware/check_auth');
const extractFile = require('../middleware/file');

const router = express.Router();

router.post('', checkAuth, extractFile, PostController.createdPost); // multer syntax as a second param which uses our storage configuration. single() method indicates that multer expects single file which comes in the image property of the incoming request.

router.get('', PostController.getPosts);

router.get('/:id', PostController.getPost);

router.put('/:id', checkAuth, extractFile, PostController.updatePost);

router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;
