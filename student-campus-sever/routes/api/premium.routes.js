const express = require("express");
const router = express.Router();
const premiumController = require("../../controllers/premium.controller");

// User premium routes
router.post("/premium/purchase", premiumController.purchasePremium);
router.get("/premium/status/:userId", premiumController.checkPremiumStatus);

// Admin routes
router.get("/premium/admin/users", premiumController.getAllUsers);
router.get("/premium/admin/revenue", premiumController.getRevenueStats);
router.get("/premium/admin/posts", premiumController.getAllPosts);
router.delete("/premium/admin/posts/:postId", premiumController.deletePost);
router.put(
  "/premium/admin/users/:userId/role",
  premiumController.updateUserRole
);
router.get(
  "/premium/admin/transactions",
  premiumController.getTransactionHistory
);

module.exports = router;
