const express = require("express");
const app = express();

app.use(express.json());
app.use(require("express-fileupload")());

app.use("/api/chat", require("./routes/chatRoutes"));

module.exports = app;