const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../utils/cloudiary');
const fs = require('fs');

const {getUserData,editUserInfo} = require('../../controllers/user.controller')
const {authenticateToken} = require('../../utils/auth')

const upload = multer({ dest: 'uploads/' });

router.get('/get/userinfo/:id',authenticateToken, getUserData);
router.post('/update/user',authenticateToken,editUserInfo)

router.post('/update/user/img', upload.single('file'), authenticateToken, editUserInfo);

module.exports = router;