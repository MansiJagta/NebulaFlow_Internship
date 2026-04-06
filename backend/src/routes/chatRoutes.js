const express = require('express');
const router = express.Router();
const { deleteMessage, editMessage } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const isSender = require('../middleware/isSender');
const checkAccess = require('../middleware/checkChannelAccess');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');
const { uploadFile } = require('../utils/uploader');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-flow-dev-secret';

// All chat routes require authenticated user context (req.user)
router.use(requireAuth);

// =======================================
// ✅ CREATE CHANNEL
// =======================================
router.post("/channel/create", async (req, res) => {
  try {
    const { name, workspaceId, isPrivate = false, members = [] } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    // 1. Check if public channel already exists in this workspace
    if (!isPrivate) {
      const existing = await Channel.findOne({ name, workspaceId, isPrivate: false });
      if (existing) return res.json(existing);
    }

    // 2. Check if DM/Private channel with exact same members and workspace exists
    if (isPrivate && members.length > 0) {
      const existing = await Channel.findOne({
        workspaceId,
        isPrivate: true,
        members: { $all: members, $size: members.length }
      });
      if (existing) return res.json(existing);
    }

    const channel = await Channel.create({
      name,
      workspaceId,
      isPrivate,
      members
    });

    res.json(channel);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to handle channel creation" });
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
    const encrypted = encrypt(req.body.content);
    
    // Get workspaceId from channel
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const msg = await Message.create({
      channelId: req.params.channelId,
      workspaceId: channel.workspaceId,
      sender: req.user.id,
      content: encrypted
    });

    const messageWithSender = await msg.populate('sender', 'fullName email avatarUrl');
    
    const responseData = {
      _id: messageWithSender._id,
      channelId: messageWithSender.channelId.toString(),
      workspaceId: messageWithSender.workspaceId.toString(),
      sender: messageWithSender.sender,
      content: req.body.content,
      isAttachment: false,
      createdAt: messageWithSender.createdAt
    };

    // Emit to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.channelId).emit('receive_message', responseData);
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// =======================================
// ✅ FILE UPLOAD (PDF / IMAGE) - Supports multiple files + text
// =======================================
router.post("/upload/:channelId", checkAccess, async (req, res) => {
  try {
    const rawFiles = req.files?.file;
    const content = req.body.content || "";
    
    if (!rawFiles && !content) {
      return res.status(400).json({ message: "No content or files provided" });
    }

    const files = Array.isArray(rawFiles) ? rawFiles : (rawFiles ? [rawFiles] : []);
    const attachments = [];

    // Process each file
    for (const file of files) {
      const result = await uploadFile(file.tempFilePath, file.name);
      
      let displayUrl = result.secure_url;
      if (result.resource_type === 'raw' && result.secure_url.includes('.pdf')) {
        displayUrl = result.secure_url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
      }

      attachments.push({
        url: encrypt(displayUrl),
        publicId: result.public_id,
        type: result.resource_type,
        filename: file.name
      });
    }

    const encryptedContent = content ? encrypt(content) : null;

    console.log('Final attachments for DB:', JSON.stringify(attachments, null, 2));

    // Get workspaceId from channel
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const msg = await Message.create({
      channelId: req.params.channelId,
      workspaceId: channel.workspaceId,
      sender: req.user.id,
      content: encryptedContent,
      attachments: attachments,
      isAttachment: attachments.length > 0,
      // Fallback for single attachment compatibility
      attachmentUrl: attachments.length > 0 ? attachments[0].url : null,
      attachmentType: attachments.length > 0 ? attachments[0].type : null,
      attachmentFilename: attachments.length > 0 ? attachments[0].filename : null,
    });

    // Return decrypted message to frontend
    const messageWithSender = await msg.populate('sender', 'fullName email avatarUrl');
    
    const responseData = {
      _id: messageWithSender._id,
      channelId: messageWithSender.channelId.toString(),
      workspaceId: messageWithSender.workspaceId?.toString(),
      sender: messageWithSender.sender,
      content: content,
      attachments: attachments.map(a => ({
        url: decrypt(a.url),
        type: a.type,
        filename: a.filename
      })),
      isAttachment: msg.isAttachment,
      createdAt: messageWithSender.createdAt
    };

    // Emit to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.channelId).emit('receive_message', responseData);
    }

    res.json(responseData);

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json(err.message);
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

    const result = messages.map((m) => {
      try {
        const decryptedContent = m.content ? decrypt(m.content) : null;
        
        // Handle multi-attachments
        const attachments = (m.attachments || []).map(a => {
          let url = decrypt(a.url);
          if (url && a.type === 'raw' && url.includes('.pdf')) {
            url = url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
          }
          return {
            url,
            type: a.type,
            filename: a.filename
          };
        });

        // Backward compatibility for single attachment
        let attachmentUrl = m.attachmentUrl ? decrypt(m.attachmentUrl) : null;
        if (attachmentUrl && m.attachmentType === 'raw' && attachmentUrl.includes('.pdf')) {
          attachmentUrl = attachmentUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
        }
        
        return {
          _id: m._id,
          channelId: m.channelId,
          sender: m.sender,
          content: decryptedContent,
          attachments,
          attachmentUrl: attachmentUrl,
          attachmentType: m.attachmentType || null,
          attachmentFilename: m.attachmentFilename || null,
          isAttachment: m.isAttachment || false,
          createdAt: m.createdAt
        };
      } catch (e) {
        // If decryption fails, return as plain text
        return {
          _id: m._id,
          channelId: m.channelId,
          sender: m.sender,
          content: m.content || null,
          attachments: [],
          attachmentUrl: m.attachmentUrl || null,
          attachmentType: m.attachmentType || null,
          attachmentFilename: m.attachmentFilename || null,
          isAttachment: m.isAttachment || false,
          createdAt: m.createdAt
        };
      }
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// =======================================
// ✅ GET FILE
// =======================================
router.get("/files/:fileId", async (req, res) => {
  try {
    // This is a simplified example; in a real app, you'd want to
    // stream the file from your storage (e.g., S3, Cloudinary)
    // For now, we'll just redirect to the decrypted URL.
    const messages = await Message.find({
      fileUrl: { $exists: true, $ne: null }
    });

    let fileUrl = null;
    for (const msg of messages) {
      const decryptedUrl = decrypt(msg.fileUrl);
      if (decryptedUrl.endsWith(req.params.fileId)) {
        fileUrl = decryptedUrl;
        break;
      }
    }

    if (fileUrl) {
      res.redirect(fileUrl);
    } else {
      res.status(404).send("File not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve file" });
  }
});

// =======================================
// ✅ DELETE MESSAGE
// =======================================
router.delete("/messages/:messageId", requireAuth, isSender, deleteMessage);

// =======================================
// ✅ EDIT MESSAGE
// =======================================
router.put("/messages/:messageId", requireAuth, isSender, editMessage);

// =======================================
// ✅ SERVE PDF (with proper headers)
// =======================================
router.get("/pdf/:messageId", async (req, res) => {
  try {
    console.log('PDF Request - MessageID:', req.params.messageId);
    
    // Auth Check: Allow Bearer header OR token query param
    let user = null;
    const authHeader = req.headers.authorization || '';
    const queryToken = req.query.token;

    if (authHeader.startsWith('Bearer ') || queryToken) {
      const token = queryToken || authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        user = await User.findById(payload.sub);
      } catch (e) {
        console.warn('JWT verification failed in PDF route');
      }
    }

    // Fallback to session
    if (!user && req.session && req.session.userId) {
      user = await User.findById(req.session.userId);
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Please provide a valid token." });
    }

    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      console.log('Message not found:', req.params.messageId);
      return res.status(404).json({ message: "Message not found" });
    }

    let pdfUrl = null;
    let filename = 'document.pdf';
    const index = req.query.index !== undefined ? parseInt(req.query.index) : null;

    if (index !== null && message.attachments && message.attachments[index]) {
      pdfUrl = decrypt(message.attachments[index].url);
      filename = message.attachments[index].filename;
    } else if (message.attachmentUrl) {
      pdfUrl = decrypt(message.attachmentUrl);
      filename = message.attachmentFilename || 'document.pdf';
    }

    if (!pdfUrl) {
      console.log('No attachment URL found');
      return res.status(404).json({ message: "PDF not found" });
    }

    console.log('Decrypted PDF URL:', pdfUrl);

    // Stream the file from Cloudinary instead of redirecting
    const response = await axios({
      method: 'get',
      url: pdfUrl,
      responseType: 'stream'
    });

    // Set correct Content-Type and Disposition
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Pipe the Cloudinary stream to the response
    response.data.pipe(res);
    
  } catch (err) {
    console.error('PDF endpoint error:', err);
    res.status(500).json({ message: "Failed to serve PDF", error: err.message });
  }
});

module.exports = router;