// const Channel = require("../models/Channel");

// module.exports = async (req, res, next) => {
//   try {
//     const { channelId } = req.params;
//     const userId = req.user.id;

//     const channel = await Channel.findById(channelId);

//     if (!channel) {
//       return res.status(404).json({ message: "Channel not found" });
//     }

//     if (!channel.isPrivate) return next();

//     if (!channel.members.includes(userId)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     req.channel = channel;
//     next();

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };










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

    // Public channel → allow
    if (!channel.isPrivate) {
      req.channel = channel;
      return next();
    }

    // Private channel → check membership
    const isMember = channel.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.channel = channel;
    next();

  } catch (err) {
    console.error("Channel Access Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};