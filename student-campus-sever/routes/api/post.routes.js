const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../utils/cloudiary');
const fs = require('fs');

const {createPost,RenderPost} = require('../../controllers/post.controller')
const {authenticateToken} = require('../../utils/auth')

// Temporary local storage for file
const upload = multer({ dest: 'uploads/' });

router.post('/create/post',authenticateToken,upload.array('files', 10),createPost );
router.get('/get/post',authenticateToken,RenderPost)


module.exports = router;