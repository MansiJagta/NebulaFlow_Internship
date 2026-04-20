const Channel = require("../models/Channel");

module.exports = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // ✅ NEW ACCESS CONTROL: Check membership for ALL channels (public AND private)
    // Users can only access channels they are members of
    const isMember = channel.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied. You are not a member of this channel." });
    }

    req.channel = channel;
    next();

  } catch (err) {
    console.error("Channel Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};