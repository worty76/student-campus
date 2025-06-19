const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../utils/cloudiary');
const fs = require('fs');

const {getUserData,
    editUserInfo,
    renderFriendyouKnow,
    SearchFriend} = require('../../controllers/user.controller')
const {authenticateToken} = require('../../utils/auth')

const upload = multer({ dest: 'uploads/' });

router.get('/get/userinfo/:id',authenticateToken, getUserData);
router.post('/update/user',authenticateToken,editUserInfo)
router.get('/get/hint/friend/:id',authenticateToken,renderFriendyouKnow)
router.post('/user/search',authenticateToken,SearchFriend)

router.post('/update/user/img', upload.single('file'), authenticateToken, editUserInfo);

module.exports = router;