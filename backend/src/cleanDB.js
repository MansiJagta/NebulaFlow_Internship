require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Issue = require('./models/Issue');
const Milestone = require('./models/Milestone');
const Meeting = require('./models/Meeting');
const Sprint = require('./models/Sprint');
const Channel = require('./models/Channel');
const Message = require('./models/Message');

async function cleanDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('\n🚮 Wiping database - removing all collections...');
    
    // Drop entire database to ensure complete cleanup
    await mongoose.connection.db.dropDatabase();

    console.log('✨ Database cleaned successfully!');
    console.log('📝 All data has been completely removed.');
    console.log('\n⚠️  Next steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Register a new user via the UI');
    console.log('   3. Create a workspace in the UI');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to clean database:', err.message);
    process.exit(1);
  }
}

cleanDatabase();
