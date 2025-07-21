const mongoose = require("mongoose");

const premiumTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "VND",
  },
  transactionType: {
    type: String,
    enum: ["premium_purchase", "premium_renewal"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["momo", "zalo_pay", "bank_transfer", "credit_card", "vnpay"],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
  },
  // VNPay specific data
  vnpayData: {
    responseCode: String,
    bankCode: String,
    cardType: String,
    vnpayTransactionId: String,
    responseMessage: String,
  },
  description: {
    type: String,
    default: "Premium subscription purchase",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("PremiumTransaction", premiumTransactionSchema);
