const express = require('express');
const multer = require('multer')
const router = express.Router();
const {authenticateToken} = require('../../utils/auth')
const {renderUserChat,uploadChatFile,createGroupChat}  = require('../../controllers/chat.controller');
const upload = multer({ dest: 'uploads/' });

router.get('/get/user/chat/:userId', authenticateToken, renderUserChat);

router.post('/chat/file/upload',authenticateToken,upload.single('file'),uploadChatFile)

module.exports = router;