const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');
const pmRoutes = require('./routes/pmRoutes');
const chatRoutes = require('./routes/chatRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const performanceRoutes = require('./routes/performanceRoutes'); // ✅ ADD THIS

const chatSocket = require('./sockets/chatSocket'); // ✅ ADD THIS

const app = express();

// ✅ Create HTTP server (IMPORTANT for socket.io)
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// ✅ Attach socket logic
chatSocket(io);
app.set('io', io); // Make io accessible to our routes

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// File upload middleware (for Cloudinary)
const fileUpload = require('express-fileupload');
app.use(fileUpload({ useTempFiles: true }));

// Debug logging
app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.originalUrl}`);
  next();
});

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nebula-flow-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/pm', pmRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/performance', performanceRoutes); // ✅ ADD THIS

console.log('✅ PM routes mounted at /api/pm');
console.log('✅ Chat routes mounted at /api/chat');
console.log('✅ Milestone routes mounted at /api/milestones');
console.log('✅ Meeting routes mounted at /api/meetings');
console.log('✅ Workspace routes mounted at /api/workspace');

// Test route
app.get('/test', (req, res) => {
  res.json({
    ok: true,
    routes: ['/api/auth', '/api/github', '/api/pm', '/api/chat']
  });
});

const PORT = process.env.PORT || 5000;

// DB + Seed
connectDB().then(async () => {
  try {
    const { seedDefaultData } = require('./seed');
    await seedDefaultData();
  } catch (err) {
    console.warn('[seed] Could not seed default data', err);
  }
});

// ❗ IMPORTANT: use server.listen NOT app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});