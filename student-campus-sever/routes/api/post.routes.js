const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../utils/cloudiary');
const fs = require('fs');

const {createPost,RenderPost,getUserPosts,updatepost,deletePost,createPostGroup, renderPostBaseOnUser,getPostById} = require('../../controllers/post.controller')
const {authenticateToken} = require('../../utils/auth')

// Temporary local storage for file
const upload = multer({ dest: 'uploads/' });

router.post('/create/post',authenticateToken,upload.array('files', 10),createPost );
router.post('/create/grpost',authenticateToken,upload.array('files', 10),createPostGroup)
router.put('/update/post/:postid',authenticateToken,upload.array('files', 10),updatepost)
router.delete('/post/delete/:id',authenticateToken,deletePost)
router.get('/get/post',authenticateToken,RenderPost);
router.get('/get/user/post/:id', authenticateToken, getUserPosts);
router.get('/get/personal/feed/:userId',authenticateToken,renderPostBaseOnUser)
router.get('/get/post/:postId', authenticateToken, getPostById);

module.exports = router;