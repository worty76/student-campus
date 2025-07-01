const express = require('express');
const router = express.Router();


const { getUserNotifications, markNotificationAsRead , markAllNotificationsAsRead ,countUnreadNotifications} = require('../../controllers/notifications.controller');
const {authenticateToken} = require('../../utils/auth')

router.get('/get/noti/:id', authenticateToken, getUserNotifications);

router.put('/mark-as-read/:notificationId', authenticateToken, markNotificationAsRead);
router.put('/mark-all-as-read/:id', authenticateToken, markAllNotificationsAsRead); 
router.get('/count-unread/:id', authenticateToken, countUnreadNotifications);


module.exports = router;
