const mongoose = require("mongoose");
const User = require("../schemas/user.model");
const PremiumTransaction = require("../schemas/premium_transaction.model");
const Post = require("../schemas/Post.model");

// Purchase premium subscription
const purchasePremium = async (req, res) => {
  const { userId, amount, paymentMethod, transactionId } = req.body;

  if (!userId || !amount || !paymentMethod) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create transaction record
    const transaction = new PremiumTransaction({
      userId: userId,
      amount: amount,
      paymentMethod: paymentMethod,
      transactionType: "premium_purchase", // Add the required field
      transactionId:
        transactionId ||
        `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "completed",
      completedAt: new Date(),
    });

    await transaction.save();

    // Update user premium status
    const premiumExpiry = new Date();
    premiumExpiry.setMonth(premiumExpiry.getMonth() + 1); // 1 month subscription

    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiry: premiumExpiry,
      premiumPurchaseDate: new Date(),
      premiumAmount: amount,
    });

    res.status(200).json({
      success: true,
      message: "Premium subscription purchased successfully",
      premiumExpiry: premiumExpiry,
    });
  } catch (error) {
    console.error("Error purchasing premium:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Check premium status
const checkPremiumStatus = async (req, res) => {
  console.log("Checking premium status for user:", req.params.userId);
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if premium has expired
    if (
      user.isPremium &&
      user.premiumExpiry &&
      new Date() > user.premiumExpiry
    ) {
      await User.findByIdAndUpdate(userId, { isPremium: false });
      user.isPremium = false;
    }

    res.status(200).json({
      success: true,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      premiumPurchaseDate: user.premiumPurchaseDate,
    });
  } catch (error) {
    console.error("Error checking premium status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Get all users with premium info
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    // Check for expired premium subscriptions
    const updatedUsers = users.map((user) => {
      if (
        user.isPremium &&
        user.premiumExpiry &&
        new Date() > user.premiumExpiry
      ) {
        User.findByIdAndUpdate(user._id, { isPremium: false });
        user.isPremium = false;
      }
      return user;
    });

    res.status(200).json({ success: true, users: updatedUsers });
  } catch (error) {
    console.error("Error getting users:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === "month") {
      dateFilter = {
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      };
    } else if (period === "year") {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    }

    const transactions = await PremiumTransaction.find({
      ...dateFilter,
      status: "completed",
    });

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTransactions = transactions.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Revenue by payment method
    const revenueByMethod = {};
    transactions.forEach((tx) => {
      if (!revenueByMethod[tx.paymentMethod]) {
        revenueByMethod[tx.paymentMethod] = 0;
      }
      revenueByMethod[tx.paymentMethod] += tx.amount;
    });

    // Premium users count
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const totalUsers = await User.countDocuments({});

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalTransactions,
        averageTransaction,
        revenueByMethod,
        premiumUsers,
        totalUsers,
        premiumConversionRate:
          totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error getting revenue stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Get all posts with management info
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "username email Faculty Major Year")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error getting posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Delete post
const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await PremiumTransaction.find({})
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error("Error getting transaction history:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  purchasePremium,
  checkPremiumStatus,
  getAllUsers,
  getRevenueStats,
  getAllPosts,
  deletePost,
  updateUserRole,
  getTransactionHistory,
};
