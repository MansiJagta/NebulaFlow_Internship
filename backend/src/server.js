const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Session management to store auth state and tokens
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nebula-flow-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true when serving over HTTPS
  })
);

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Initialise DB (logs either "Connected to MongoDB" or a short failure message)
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
