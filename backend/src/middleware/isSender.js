const Message = require('../models/Message');

/**
 * Middleware to check if the user is the sender of a message.
 * Assumes messageId is present in req.params.
 */
const isSender = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ message: 'Message ID is required' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Safely compare IDs
    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id;
    const messageSenderId = message.sender ? message.sender.toString() : null;

    if (messageSenderId !== currentUserId) {
      console.warn(`[isSender] Unauthorized attempt: User ${currentUserId} tried to modify message ${messageId} owned by ${messageSenderId}`);
      return res.status(403).json({ 
        message: 'Access denied. You are not the sender of this message.',
        userId: currentUserId,
        ownerId: messageSenderId
      });
    }

    // Attach message to request for convenience
    req.message = message;
    next();
  } catch (err) {
    console.error('isSender middleware error:', err);
    res.status(500).json({ message: 'Internal server error while verifying authorship' });
  }
};

module.exports = isSender;
