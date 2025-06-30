const express = require('express');
const router = express.Router();
const multer = require('multer');

const {getUserData,
    editUserInfo,
    renderFriendyouKnow,
    SearchFriend,
    updatePrivacySettings,
    updatePassword
} = require('../../controllers/user.controller')


const {authenticateToken} = require('../../utils/auth')

const upload = multer({ dest: 'uploads/' });
router.get('/get/userinfo/:id',authenticateToken, getUserData);
router.post('/update/user',authenticateToken,editUserInfo);
router.get('/get/hint/friend/:id',authenticateToken,renderFriendyouKnow);
router.post('/user/search',authenticateToken,SearchFriend);
router.put('/update/privacy/:id', authenticateToken, updatePrivacySettings);
router.put('/update/password/:id', authenticateToken, updatePassword);
router.post('/update/user/img', authenticateToken, upload.single('file'), editUserInfo);

module.exports = router;