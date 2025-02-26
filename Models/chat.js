const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chat: String,

    sender: {
      type: mongoose.Schema.ObjectId, // Only store the ObjectId reference to User
      ref: "User",  // Reference to the User model
      required: true
    },

    recipient: {
      type: [mongoose.Schema.ObjectId], // Array of ObjectIds for multiple recipients
      ref: "User",  // Reference to the User model
      required: true
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    isRead: {
      type: Boolean,
      default: false
    },

    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Chat", chatSchema);