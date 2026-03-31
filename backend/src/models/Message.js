// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema({
//   channelId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Channel"
//   },

//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   },

//   content: String,  // 🔐 encrypted
//   fileUrl: String,  // 🔐 encrypted

//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("Message", messageSchema);








const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String, // 🔐 encrypted text
    default: null
  },

  fileUrl: {
    type: String, // 🔐 encrypted file link
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true // adds createdAt + updatedAt automatically
});

module.exports = mongoose.model("Message", messageSchema);