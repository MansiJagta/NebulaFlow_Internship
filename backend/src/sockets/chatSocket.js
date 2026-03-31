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
    });

    socket.on("send_message", (data) => {
      io.to(data.channelId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};