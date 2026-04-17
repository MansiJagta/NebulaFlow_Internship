// const mongoose = require("mongoose");

// const channelSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   workspaceId: { type: String, required: true },

//   isPrivate: { type: Boolean, default: false },

//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

//   secretKey: { type: String, required: true } // encrypted key
// }, { timestamps: true });

// module.exports = mongoose.model("Channel", channelSchema);







// const mongoose = require("mongoose");

// const channelSchema = new mongoose.Schema({
//   name: String,
//   isPrivate: { type: Boolean, default: false },

//   members: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "User" }
//   ],

//   encryptedKey: String
// });

// module.exports = mongoose.model("Channel", channelSchema);





const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  name: String,
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Channel", channelSchema);