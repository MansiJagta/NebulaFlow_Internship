require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Issue = require('./models/Issue');
const Milestone = require('./models/Milestone');
const Meeting = require('./models/Meeting');
const Sprint = require('./models/Sprint');

async function resetDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('🚮 Wiping database collections...');
    
    // Completely clear all data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Issue.deleteMany({});
    await Milestone.deleteMany({});
    await Meeting.deleteMany({});
    await Sprint.deleteMany({});
    
    // UserIdentity might be part of the User model natively or a separate collection.
    // If it's a separate collection created implicitly, we can drop the DB natively.
    // Safer to drop the entire database contents to ensure absolutely everything is gone.
    await mongoose.connection.db.dropDatabase();

    console.log('✨ All Users, Workspaces, Identities, Repositories, and Dummy data have been completely wiped.');
    console.log('Please register a brand new user and workspace in the UI before seeding again!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to wipe DB:', err);
    process.exit(1);
  }
}

resetDatabase();
