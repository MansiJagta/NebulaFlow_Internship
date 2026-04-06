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

  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
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

  isAttachment: {
    type: Boolean,
    default: false
  },

  attachmentUrl: {
    type: String, // 🔐 encrypted URL (for Cloudinary files)
    default: null
  },

  attachmentType: {
    type: String, // 'raw' for PDFs, 'image' for images, etc.
    default: null
  },

  attachmentFilename: {
    type: String,
    default: null
  },

  attachments: [
    {
      url: { type: String },
      publicId: { type: String }, // For Cloudinary deletion
      type: { type: String },
      filename: { type: String }
    }
  ],

  isEdited: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true // adds createdAt + updatedAt automatically
});

module.exports = mongoose.model("Message", messageSchema);