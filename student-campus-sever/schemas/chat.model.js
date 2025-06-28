// models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: String, // or mongoose.Schema.Types.ObjectId if you want to reference User IDs
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  chatContext: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    userid: {
      type: String,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      default: '' // Allow empty text when files are sent
    },
    files: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }],
    timestamp: { // Changed from timecreated to match your code
      type: Date,
      default: Date.now
    }
  }],
  lasttext: {
    _id: mongoose.Schema.Types.ObjectId,
    userid: {
      type: String,
      ref: 'User',
    },
    text: {
      type: String,
    },
    timestamp: { 
      type: Date,
    }
  },
  isBlock: {
    type: Boolean,
    required: true, // Fixed typo: "require" -> "required"
    default: false
  }
}, {
  timestamps: true // This will add createdAt and updatedAt automatically
});

module.exports = mongoose.model('Chat', ChatSchema);