const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: {type: String},
    createAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['read', 'unread'], default: 'unread' },
    type: { type: String, required: true },
    context: { type: String }
});

module.exports = mongoose.model('Notification', notificationSchema);