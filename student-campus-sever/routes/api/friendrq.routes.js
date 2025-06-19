const express = require('express')

const router = express.Router()

const {authenticateToken} = require('../../utils/auth')
const {getUserFriendRequest}  = require('../../controllers/friendrequest.controller.routes')


router.post('/get/list-friend',authenticateToken,getUserFriendRequest)

module.exports = router