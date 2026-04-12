require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');

async function deleteAllMessages() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('\n🗑️  Deleting all messages...');
    const result = await Message.deleteMany({});

    console.log(`✨ Successfully deleted ${result.deletedCount} message(s)`);
    console.log('📝 Message collection is now empty.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to delete messages:', err.message);
    process.exit(1);
  }
}

deleteAllMessages();
