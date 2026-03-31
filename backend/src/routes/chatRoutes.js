// const express = require("express");
// const router = express.Router();

// const Message = require("../models/Message");
// const { encrypt, decrypt } = require("../utils/encryption");
// const checkAccess = require("../middleware/checkChannelAccess");
// const { uploadFile } = require("../utils/uploader");

// // SEND MESSAGE
// router.post("/send/:channelId", checkAccess, async (req, res) => {
//   try {
//     const encrypted = encrypt(req.body.content);

//     const msg = await Message.create({
//       channelId: req.params.channelId,
//       sender: req.user.id,
//       content: encrypted
//     });

//     res.json(msg);

//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// // FILE UPLOAD
// router.post("/upload/:channelId", checkAccess, async (req, res) => {
//   try {
//     const file = req.files.file;

//     const uploaded = await uploadFile(file.tempFilePath);

//     const encryptedUrl = encrypt(uploaded.secure_url);

//     const msg = await Message.create({
//       channelId: req.params.channelId,
//       sender: req.user.id,
//       fileUrl: encryptedUrl
//     });

//     res.json(msg);

//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// // GET MESSAGES
// router.get("/:channelId", checkAccess, async (req, res) => {
//   try {
//     const messages = await Message.find({
//       channelId: req.params.channelId
//     });

//     const result = messages.map((m) => ({
//       ...m._doc,
//       content: m.content ? decrypt(m.content) : null,
//       fileUrl: m.fileUrl ? decrypt(m.fileUrl) : null
//     }));

//     res.json(result);

//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// module.exports = router;











const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Channel = require("../models/Channel");
const { requireAuth } = require("../middleware/auth");

const { encrypt, decrypt } = require("../utils/encryption");
const checkAccess = require("../middleware/checkChannelAccess");
const { uploadFile } = require("../utils/uploader");

// All chat routes require authenticated user context (req.user)
router.use(requireAuth);


// =======================================
// ✅ CREATE CHANNEL
// =======================================
router.post("/channel/create", async (req, res) => {
  try {
    const { name, isPrivate = false, members = [] } = req.body;

    const channel = await Channel.create({
      name,
      isPrivate,
      members
    });

    res.json(channel);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create channel" });
  }
});


// =======================================
// ✅ ADD MEMBER
// =======================================
router.post("/channel/add-member", async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    await Channel.findByIdAndUpdate(channelId, {
      $addToSet: { members: userId }
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
});


// =======================================
// ✅ SEND MESSAGE
// =======================================
router.post("/send/:channelId", checkAccess, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content required" });
    }

    const encrypted = encrypt(content);

    const msg = await Message.create({
      channelId: req.params.channelId,
      sender: req.user.id,
      content: encrypted
    });

    // Return decrypted content + expected sender shape for frontend
    const populatedMsg = await msg.populate("sender", "fullName email avatarUrl");

    res.json({
      _id: populatedMsg._id,
      channelId: populatedMsg.channelId,
      sender: populatedMsg.sender,
      content,
      fileUrl: null,
      createdAt: populatedMsg.createdAt,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});


// =======================================
// ✅ FILE UPLOAD (PDF / IMAGE)
// =======================================
router.post("/upload/:channelId", checkAccess, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;

    const uploaded = await uploadFile(file.tempFilePath);

    const encryptedUrl = encrypt(uploaded.secure_url);

    const msg = await Message.create({
      channelId: req.params.channelId,
      sender: req.user.id,
      fileUrl: encryptedUrl
    });

    const populatedMsg = await msg.populate("sender", "fullName email avatarUrl");

    res.json({
      _id: populatedMsg._id,
      channelId: populatedMsg.channelId,
      sender: populatedMsg.sender,
      content: null,
      fileUrl: uploaded.secure_url,
      createdAt: populatedMsg.createdAt,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "File upload failed" });
  }
});


// =======================================
// ✅ GET MESSAGES (DECRYPTED)
// =======================================
router.get("/:channelId", checkAccess, async (req, res) => {
  try {
    const messages = await Message.find({
      channelId: req.params.channelId
    })
      .populate("sender", "fullName email avatarUrl")
      .sort({ createdAt: 1 }); // oldest → newest

    const result = messages.map((m) => ({
      _id: m._id,
      channelId: m.channelId,
      sender: m.sender,

      content: m.content ? decrypt(m.content) : null,
      fileUrl: m.fileUrl ? decrypt(m.fileUrl) : null,

      createdAt: m.createdAt
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;