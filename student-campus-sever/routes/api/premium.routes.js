const express = require('express');
const router = express.Router();
const premiumController = require('../../controllers/premium.controller');

// User premium routes
router.post('/purchase', premiumController.purchasePremium);
router.get('/status/:userId', premiumController.checkPremiumStatus);

// Admin routes
router.get('/admin/users', premiumController.getAllUsers);
router.get('/admin/revenue', premiumController.getRevenueStats);
router.get('/admin/posts', premiumController.getAllPosts);
router.delete('/admin/posts/:postId', premiumController.deletePost);
router.put('/admin/users/:userId/role', premiumController.updateUserRole);
router.get('/admin/transactions', premiumController.getTransactionHistory);

module.exports = router; 