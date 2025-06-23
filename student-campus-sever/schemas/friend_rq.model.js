const mongoose = require('mongoose');

const friendRqSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  sendAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Friend_rq', friendRqSchema);