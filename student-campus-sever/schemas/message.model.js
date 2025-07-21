// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "sticker", "emoji", "system"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId], // ví dụ: { "👍": [userId1, userId2] }
    },
    attachments: [
      {
        url: String,
        type: String,
        fileName: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
