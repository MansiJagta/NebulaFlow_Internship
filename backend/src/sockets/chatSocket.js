// module.exports = (io) => {
//   io.on("connection", (socket) => {

//     console.log("User connected:", socket.id);

//     socket.on("join_channel", (channelId) => {
//       socket.join(channelId);
//     });

//     socket.on("send_message", (data) => {
//       io.to(data.channelId).emit("receive_message", data);
//     });

//   });
// };






module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join_channel", (channelId) => {
      socket.join(channelId);
      console.log(`[Socket] User ${socket.id} joined channel: ${channelId}`);
    });

    socket.on("send_message", (data) => {
      console.log(`[Socket] Message received for channel ${data.channelId} from user ${socket.id}`);
      // Broadcast to all users in the channel (including sender)
      io.to(data.channelId).emit("receive_message", data);
      console.log(`[Socket] Message broadcasted to channel: ${data.channelId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};