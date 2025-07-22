const mongoose = require("mongoose");
const User = require("../schemas/user.model");
const PremiumTransaction = require("../schemas/premium_transaction.model");
const Post = require("../schemas/Post.model");
const vnpayService = require("../utils/vnpay");

// Create VNPay payment URL
const createVNPayPayment = async (req, res) => {
  const { userId, amount, bankCode, language } = req.body;

  console.log("VNPay Environment Check:", {
    VNP_TMNCODE: process.env.VNP_TMNCODE ? "Set" : "Not set",
    VNP_HASHSECRET: process.env.VNP_HASHSECRET ? "Set" : "Not set",
    VNP_URL: process.env.VNP_URL ? "Set" : "Not set",
    VNP_RETURN_URL: process.env.VNP_RETURN_URL ? "Set" : "Not set",
  });

  if (!userId || !amount) {
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

    // Generate unique order ID with current timestamp
    const date = new Date();
    const orderId = `PREMIUM_${userId}_${date.getTime()}`;
    const orderDescription = `Thanh toan goi Premium - ${user.username}`;

    // Create pending transaction
    const transaction = new PremiumTransaction({
      userId: userId,
      amount: amount,
      paymentMethod: "vnpay",
      transactionType: "premium_purchase",
      transactionId: orderId,
      status: "pending",
      description: orderDescription,
    });

    await transaction.save();

    // Performance monitoring for VNPay integration
    const startTime = Date.now();

    // Extract real client IP address for production environments
    const clientIpAddress = vnpayService.getClientIpAddress(req);
    console.log("Client IP Address extracted for VNPay:", clientIpAddress);

    // Create VNPay payment URL using studenthub compatible parameters
    try {
      const paymentUrl = vnpayService.createPaymentUrl({
        orderId: orderId,
        amount: amount,
        orderInfo: orderDescription,
        bankCode: bankCode,
        locale: language || "vn",
        ipAddr: clientIpAddress,
        returnUrl: process.env.VNP_RETURN_URL,
      });

      const totalProcessingTime = Date.now() - startTime;

      console.log("VNPay Payment Creation Summary:", {
        orderId,
        amount,
        clientIP: clientIpAddress,
        totalProcessingTimeMs: totalProcessingTime,
        paymentUrlLength: paymentUrl.length,
        expirationMinutes: 30,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderId,
        expiresIn: 30 * 60 * 1000, // 30 minutes in milliseconds
        processingTime: totalProcessingTime,
      });
    } catch (vnpayError) {
      console.error("VNPay Service Error:", vnpayError);

      // Update transaction status to failed
      transaction.status = "failed";
      transaction.failureReason = vnpayError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        message: "VNPay payment URL generation failed",
        error: vnpayError.message,
        orderId: orderId,
      });
    }
  } catch (error) {
    console.error("Error creating VNPay payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Handle VNPay return callback with enhanced verification
const handleVNPayReturn = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("VNPay Return Parameters:", req.query);

    const vnpParams = req.query;

    // Enhanced signature verification with performance monitoring
    const isValidSignature = vnpayService.measurePerformance(
      "Signature_Verification",
      () => {
        return vnpayService.verifyReturnUrl(vnpParams);
      }
    );

    console.log("VNPay Return Validation:", {
      signatureValid: isValidSignature,
      processingTimeMs: Date.now() - startTime,
      orderId: vnpParams.vnp_TxnRef,
      responseCode: vnpParams.vnp_ResponseCode,
    });

    if (!isValidSignature) {
      console.error("VNPay Return - Invalid signature detected");
      return res.status(400).json({
        success: false,
        message: "Invalid signature - security verification failed",
      });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionStatus = vnpParams.vnp_TransactionStatus;
    const amount = parseInt(vnpParams.vnp_Amount) / 100; // Convert from VND cents
    const bankCode = vnpParams.vnp_BankCode;
    const cardType = vnpParams.vnp_CardType;
    const transactionId = vnpParams.vnp_TransactionNo;

    console.log("Processing transaction:", {
      orderId,
      responseCode,
      transactionStatus,
      amount,
    });

    // Find the transaction
    const transaction = await PremiumTransaction.findOne({
      transactionId: orderId,
    });

    if (!transaction) {
      console.log("Transaction not found for orderId:", orderId);
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (responseCode === "00" && transactionStatus === "00") {
      // Payment successful
      console.log("Payment successful, updating transaction and user...");

      transaction.status = "completed";
      transaction.completedAt = new Date();
      transaction.vnpayData = {
        responseCode,
        bankCode,
        cardType,
        vnpayTransactionId: transactionId,
        responseMessage: vnpayService.getResponseMessage(responseCode),
      };
      await transaction.save();

      console.log("Transaction updated successfully");

      // Update user premium status
      const premiumExpiry = new Date();
      premiumExpiry.setMonth(premiumExpiry.getMonth() + 1); // 1 month subscription

      const userUpdate = await User.findByIdAndUpdate(
        transaction.userId,
        {
          isPremium: true,
          premiumExpiry: premiumExpiry,
          premiumPurchaseDate: new Date(),
          premiumAmount: amount,
        },
        { new: true }
      );

      console.log("User updated successfully:", userUpdate ? "Yes" : "No");

      // Redirect to frontend success page instead of JSON response
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/premium/payment-result?success=true&orderId=${orderId}&responseCode=${responseCode}`
      );
    } else {
      // Payment failed
      console.log("Payment failed with code:", responseCode);

      transaction.status = "failed";
      transaction.vnpayData = {
        responseCode,
        bankCode,
        cardType,
        responseMessage: vnpayService.getResponseMessage(responseCode),
      };
      await transaction.save();

      // Redirect to frontend failure page
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/premium/payment-result?success=false&orderId=${orderId}&responseCode=${responseCode}&message=${encodeURIComponent(
          vnpayService.getResponseMessage(responseCode)
        )}`
      );
    }
  } catch (error) {
    console.error("Error handling VNPay return:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Handle VNPay IPN (Instant Payment Notification)
const handleVNPayIPN = async (req, res) => {
  try {
    const vnpParams = req.query;
    const isValidSignature = vnpayService.verifyReturnUrl(vnpParams);

    if (!isValidSignature) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Checksum failed" });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionStatus = vnpParams.vnp_TransactionStatus;
    const amount = parseInt(vnpParams.vnp_Amount) / 100; // Convert from VND cents

    const transaction = await PremiumTransaction.findOne({
      transactionId: orderId,
    });

    if (!transaction) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    // Check amount
    if (amount !== transaction.amount) {
      return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
    }

    // Check if transaction is already processed
    if (transaction.status !== "pending") {
      return res.status(200).json({
        RspCode: "02",
        Message: "This order has been updated to the payment status",
      });
    }

    if (responseCode === "00" && transactionStatus === "00") {
      // Payment successful
      transaction.status = "completed";
      transaction.completedAt = new Date();
      transaction.vnpayData = {
        responseCode,
        vnpayTransactionId: vnpParams.vnp_TransactionNo,
        responseMessage: vnpayService.getResponseMessage(responseCode),
      };
      await transaction.save();

      // Update user premium status
      const premiumExpiry = new Date();
      premiumExpiry.setMonth(premiumExpiry.getMonth() + 1); // 1 month subscription

      await User.findByIdAndUpdate(transaction.userId, {
        isPremium: true,
        premiumExpiry: premiumExpiry,
        premiumPurchaseDate: new Date(),
        premiumAmount: amount,
      });

      res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      // Payment failed
      transaction.status = "failed";
      transaction.vnpayData = {
        responseCode,
        responseMessage: vnpayService.getResponseMessage(responseCode),
      };
      await transaction.save();

      res.status(200).json({ RspCode: "00", Message: "Success" });
    }
  } catch (error) {
    console.error("VNPay IPN error:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

// Purchase premium subscription (legacy - kept for backward compatibility)
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
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayIPN,
};
