const Message = require('../models/Message');
const { deleteFile } = require('../utils/uploader');
const { encrypt, decrypt } = require('../utils/encryption');

const deleteMessage = async (req, res) => {
  try {
    // message is already attached to req by isSender middleware
    const message = req.message;

    // Delete attachments from Cloudinary if they exist
    if (message.attachments && message.attachments.length > 0) {
      for (const att of message.attachments) {
        if (att.publicId) {
          await deleteFile(att.publicId, att.type);
        }
      }
    }

    const channelId = message.channelId.toString();
    await message.deleteOne();

    // Broadcast the deletion to other clients in the channel
    const io = req.app.get('io');
    io.to(channelId).emit('message_deleted', req.params.messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: err.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const message = req.message;
    const { content } = req.body;

    if (!content && !message.isAttachment) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content) {
      message.content = encrypt(content);
    }
    
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id).populate('sender', 'fullName email avatarUrl');
    
    // Decrypt content for response
    const responseData = {
      ...updatedMessage.toObject(),
      content: content // use the raw content we just saved
    };

    // Decrypt attachments for response if any
    if (responseData.attachments) {
      responseData.attachments = responseData.attachments.map(att => ({
        ...att,
        url: att.url // Already plain text
      }));
    }

    // Broadcast the update
    const io = req.app.get('io');
    io.to(message.channelId.toString()).emit('message_updated', responseData);

    res.json(responseData);
  } catch (err) {
    console.error('Edit error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  deleteMessage,
  editMessage,
};
