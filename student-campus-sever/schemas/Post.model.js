const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  file: {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    filetype: {
      type: String,
      enum: ['image', 'video', 'pdf', 'pptx', 'txt', 'document'],
      required: true,
    },
  }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  attachments: [attachmentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      type: Array,
      ref: 'User'
    }
  ],
  comments:   {
      type: Array,
      ref: 'User'
    }
});

module.exports = mongoose.model('posts', postSchema);
