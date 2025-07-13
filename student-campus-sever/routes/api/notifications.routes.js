const express = require('express');
const router = express.Router();


const { getUserNotifications, markNotificationAsRead , markAllNotificationsAsRead ,countUnreadNotifications,deleteAllUserRead} = require('../../controllers/notifications.controller');
const {authenticateToken} = require('../../utils/auth')

router.get('/get/noti/:id', authenticateToken, getUserNotifications);

router.put('/mark-as-read/:notificationId', authenticateToken, markNotificationAsRead);
router.put('/mark-all-as-read/:id', authenticateToken, markAllNotificationsAsRead); 
router.get('/count-unread/:id', authenticateToken, countUnreadNotifications);
router.delete('/delte-read/:id',authenticateToken,deleteAllUserRead)

module.exports = router;
