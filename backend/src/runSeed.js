require('dotenv').config();
const mongoose = require('mongoose');
const { seedDefaultData } = require('./seed');

console.log('Connecting to:', process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Missing URI');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB. Starting seed process...');
    return seedDefaultData();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to run seed:', err);
    process.exit(1);
  });
