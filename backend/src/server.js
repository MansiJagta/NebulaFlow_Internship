const path = require('path');
require('dotenv').config();

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://nebula-flow-internship-nine.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173'
];

app.use(cors({ 
  origin: function (origin, callback) {
    console.log('[cors] Incoming origin:', origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('[cors] ❌ Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Debug logging for all incoming requests (Enhanced)
app.use((req, res, next) => {
  console.log(`\n--> ${req.method} ${req.originalUrl}`);
  console.log(`[req] Origin: ${req.get('origin') || 'N/A'}`);
  console.log(`[req] Has Authorization: ${!!req.get('Authorization')}`);
  console.log(`[req] Has Cookies: ${!!req.get('Cookie')}`);
  next();
});

// File upload middleware (for Cloudinary)
const fileUpload = require('express-fileupload');
app.use(fileUpload({ useTempFiles: true }));

// Session config
app.set('trust proxy', 1); // IMPORTANT for Render/Vercel (Load Balancers)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nebula-flow-secret',
    resave: false,
    saveUninitialized: false,
    proxy: true, 
    name: 'nebula.sid', // Custom cookie name
    cookie: { 
      secure: true, // MUST be true for SameSite: none
      httpOnly: true,
      sameSite: 'none', // MUST be none for cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
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

    // 🧪 DEV: Create test user in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { getOrCreateTestUser } = require('./utils/devHelper');
        const testUserInfo = await getOrCreateTestUser();
        console.log('\n🧪 TEST CREDENTIALS (Development Only)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email: ${testUserInfo.credentials.email}`);
        console.log(`Password: ${testUserInfo.credentials.password}`);
        console.log(`Token: ${testUserInfo.token}`);
        console.log('\nUsage: Add to request headers:');
        console.log(`Authorization: Bearer ${testUserInfo.token}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (err) {
        console.warn('[devHelper] Could not create test user', err.message);
      }
    }
  } catch (err) {
    console.warn('[seed] Could not seed default data', err);
  }
});

// ❗ IMPORTANT: use server.listen NOT app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});