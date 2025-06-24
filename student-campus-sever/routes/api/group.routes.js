const express = require('express')
const { createGroup, joinGroup, renderGroup, renderUserGroups ,rendergrouppost ,renderPostsFromGroups} = require('../../controllers/group.controller');

const {authenticateToken} = require('../../utils/auth')
const router = express.Router();


router.post('/create/group',authenticateToken,createGroup)
router.put('/join/group',authenticateToken,joinGroup)
router.get('/get/user/group/:userId',authenticateToken,renderUserGroups)
router.get('/get/group',authenticateToken,renderGroup)
router.get('/get/group/post/:groupid',authenticateToken,rendergrouppost)
router.post('/getall/group/post',authenticateToken,renderPostsFromGroups)
module.exports = router