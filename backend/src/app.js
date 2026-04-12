const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("express-fileupload")({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}));

app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workspace", require("./routes/workspaceRoutes"));
app.use("/api/pm", require("./routes/pmRoutes"));
app.use("/api/meetings", require("./routes/meetingRoutes"));
app.use("/api/milestones", require("./routes/milestoneRoutes"));
app.use("/api/github", require("./routes/githubRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/invite", require("./routes/inviteRoutes"));

module.exports = app;